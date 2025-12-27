// 多肉养殖记录应用 - JavaScript 逻辑

// 数据存储类
class PlantStorage {
    constructor() {
        this.plants = this.loadPlants();
        this.careRecords = this.loadCareRecords();
    }

    // 加载植物数据
    loadPlants() {
        const plants = localStorage.getItem('plants');
        return plants ? JSON.parse(plants) : [];
    }

    // 保存植物数据
    savePlants() {
        localStorage.setItem('plants', JSON.stringify(this.plants));
    }

    // 加载养护记录
    loadCareRecords() {
        const records = localStorage.getItem('careRecords');
        return records ? JSON.parse(records) : [];
    }

    // 保存养护记录
    saveCareRecords() {
        localStorage.setItem('careRecords', JSON.stringify(this.careRecords));
    }

    // 添加植物
    addPlant(plant) {
        const newPlant = {
            id: Date.now().toString(),
            ...plant
        };
        this.plants.push(newPlant);
        this.savePlants();
        return newPlant;
    }

    // 删除植物
    deletePlant(plantId) {
        this.plants = this.plants.filter(plant => plant.id !== plantId);
        this.careRecords = this.careRecords.filter(record => record.plantId !== plantId);
        this.savePlants();
        this.saveCareRecords();
    }

    // 更新植物信息
    updatePlant(updatedPlant) {
        const index = this.plants.findIndex(plant => plant.id === updatedPlant.id);
        if (index !== -1) {
            // 保留原图片（如果没有提供新图片）
            if (!updatedPlant.image) {
                updatedPlant.image = this.plants[index].image;
            }
            this.plants[index] = updatedPlant;
            this.savePlants();
            return updatedPlant;
        }
        return null;
    }

    // 添加养护记录
    addCareRecord(record) {
        const newRecord = {
            id: Date.now().toString(),
            ...record,
            timestamp: new Date().toISOString() // 添加时间戳
        };
        this.careRecords.push(newRecord);
        this.saveCareRecords();
        return newRecord;
    }

    // 获取植物的养护记录
    getCareRecordsByPlantId(plantId) {
        return this.careRecords
            .filter(record => record.plantId === plantId)
            .sort((a, b) => new Date(b.date) - new Date(a.date));
    }
}

// 应用类
class PlantApp {
    constructor() {
        this.storage = new PlantStorage();
        this.init();
    }

    // 初始化应用
    init() {
        this.bindEvents();
        this.renderPlants();
        this.setDefaultDate();
    }

    // 绑定事件
    bindEvents() {
        // 植物图片预览
        const imageInput = document.getElementById('plant-image');
        const imagePreview = document.getElementById('image-preview');
        
        imageInput.addEventListener('change', (e) => {
            this.handleImagePreview(e, imagePreview);
        });

        // 编辑植物图片预览
        const editImageInput = document.getElementById('edit-plant-image');
        const editImagePreview = document.getElementById('edit-image-preview');
        
        editImageInput.addEventListener('change', (e) => {
            this.handleImagePreview(e, editImagePreview);
        });

        // 养护记录图片预览
        const careImageInput = document.getElementById('care-image');
        const careImagePreview = document.getElementById('care-image-preview');
        
        careImageInput.addEventListener('change', (e) => {
            this.handleImagePreview(e, careImagePreview);
        });

        // 控制添加植物表单的显示/隐藏
        const addPlantBtn = document.getElementById('add-plant-btn');
        const addPlantSection = document.getElementById('add-plant-section');
        const cancelAddBtn = document.getElementById('cancel-add-btn');

        // 点击添加植物按钮，显示表单
        addPlantBtn.addEventListener('click', () => {
            addPlantSection.style.display = 'block';
            // 滚动到表单位置
            addPlantSection.scrollIntoView({ behavior: 'smooth' });
        });

        // 点击取消按钮，隐藏表单
        cancelAddBtn.addEventListener('click', () => {
            addPlantSection.style.display = 'none';
            // 重置表单
            document.getElementById('plant-form').reset();
            document.getElementById('image-preview').innerHTML = '';
            this.setDefaultDate();
        });

        // 植物表单提交
        document.getElementById('plant-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddPlant(e, addPlantSection);
        });

        // 养护记录表单提交
        document.getElementById('care-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddCareRecord(e);
        });

        // 编辑植物表单提交
        document.getElementById('edit-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleEditPlant(e);
        });

        // 模态框关闭事件 - 为所有模态框添加关闭功能
        document.querySelectorAll('.modal .close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                modal.style.display = 'none';
            });
        });

        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    // 设置默认日期为今天
    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('plant-acquisition-date').value = today;
        document.getElementById('care-date').value = today;
    }

    // 处理图片预览
    handleImagePreview(e, previewContainer) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                previewContainer.innerHTML = `<img src="${event.target.result}" style="max-width: 100%; max-height: 200px; border-radius: 6px;" alt="植物图片预览">`;
            };
            reader.readAsDataURL(file);
        } else {
            previewContainer.innerHTML = '';
        }
    }

    // 处理添加植物
    handleAddPlant(e, addPlantSection) {
        const form = e.target;
        const formData = new FormData(form);
        const plant = {
            name: formData.get('name'),
            species: formData.get('species'),
            acquisitionDate: formData.get('acquisitionDate'),
            location: formData.get('location')
        };

        // 处理图片上传
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                plant.image = event.target.result; // 存储base64编码的图片
                this.storage.addPlant(plant);
                this.resetForm(form);
                addPlantSection.style.display = 'none'; // 隐藏表单
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.storage.addPlant(plant);
            this.resetForm(form);
            addPlantSection.style.display = 'none'; // 隐藏表单
        }
    }

    // 重置表单
    resetForm(form) {
        form.reset();
        this.setDefaultDate(); // 重置日期为今天
        document.getElementById('image-preview').innerHTML = ''; // 清空图片预览
        this.renderPlants();
    }

    // 处理编辑植物
    handleEditPlant(e) {
        const form = e.target;
        const formData = new FormData(form);
        const plantId = formData.get('plantId');
        const updatedPlant = {
            id: plantId,
            name: formData.get('name'),
            species: formData.get('species'),
            acquisitionDate: formData.get('acquisitionDate'),
            location: formData.get('location')
        };

        // 处理图片上传
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                updatedPlant.image = event.target.result; // 存储base64编码的图片
                this.storage.updatePlant(updatedPlant);
                this.closeEditModal();
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.storage.updatePlant(updatedPlant);
            this.closeEditModal();
        }
    }

    // 关闭编辑模态框
    closeEditModal() {
        const modal = document.getElementById('edit-modal');
        modal.style.display = 'none';
        this.renderPlants();
    }

    // 打开大图模态框
    openImageModal(imageSrc) {
        const modal = document.getElementById('image-modal');
        const largeImage = document.getElementById('large-image');
        largeImage.src = imageSrc;
        modal.style.display = 'block';
    }

    // 处理添加养护记录
    handleAddCareRecord(e) {
        const form = e.target;
        const formData = new FormData(form);
        const record = {
            plantId: formData.get('plantId'),
            type: formData.get('type'),
            date: formData.get('date'),
            notes: formData.get('notes')
        };

        // 处理养护记录图片上传
        const imageFile = formData.get('image');
        if (imageFile && imageFile.size > 0) {
            const reader = new FileReader();
            reader.onload = (event) => {
                record.image = event.target.result; // 存储base64编码的图片
                this.storage.addCareRecord(record);
                this.closeModal();
                this.renderPlants();
            };
            reader.readAsDataURL(imageFile);
        } else {
            this.storage.addCareRecord(record);
            this.closeModal();
            this.renderPlants();
        }
    }

    // 打开养护记录模态框
    openModal(plantId) {
        document.getElementById('care-plant-id').value = plantId;
        document.getElementById('care-modal').style.display = 'block';
    }

    // 关闭养护记录模态框
    closeModal() {
        const modal = document.getElementById('care-modal');
        const form = document.getElementById('care-form');
        
        modal.style.display = 'none';
        form.reset();
        this.setDefaultDate(); // 重置日期为今天
        
        // 清空养护图片预览
        document.getElementById('care-image-preview').innerHTML = '';
    }

    // 渲染植物列表
    renderPlants() {
        const container = document.getElementById('plants-container');
        const plants = this.storage.plants;

        if (plants.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>还没有添加多肉植物，点击上方的"添加多肉植物"开始记录吧！</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="plants-grid">
                ${plants.map(plant => this.renderPlantCard(plant)).join('')}
            </div>
        `;

        // 绑定卡片事件
        this.bindCardEvents();
    }

    // 渲染植物卡片
    renderPlantCard(plant) {
        const careRecords = this.storage.getCareRecordsByPlantId(plant.id);
        const careTypeLabels = {
            water: '浇水',
            fertilize: '施肥',
            repot: '换盆',
            prune: '修剪'
        };

        return `
            <div class="plant-card" data-plant-id="${plant.id}">
                <div style="display: flex; align-items: center; margin-bottom: 15px;">
                    ${plant.image ? 
                        `<div class="plant-image" style="margin-right: 15px;">
                            <img class="plant-avatar" data-src="${plant.image}" src="${plant.image}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 50%; border: 2px solid #e2e8f0; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease;" alt="${plant.name}" onclick="app.openImageModal('${plant.image}')">
                        </div>` : 
                        `<div class="plant-image" style="margin-right: 15px;">
                            <div style="width: 80px; height: 80px; background-color: #e2e8f0; border-radius: 50%; border: 2px solid #cbd5e0; display: flex; justify-content: center; align-items: center; font-size: 24px; color: #a0aec0;">
                                🌱
                            </div>
                        </div>`
                    }
                    <h3 style="margin: 0; font-size: 1.4rem;">${plant.name}</h3>
                </div>
                <div class="plant-info">
                    <p><strong>品种：</strong>${plant.species}</p>
                    <p><strong>入手日期：</strong>${plant.acquisitionDate}</p>
                    <p><strong>摆放位置：</strong>${plant.location || '未设置'}</p>
                </div>
                <div class="care-records">
                    <h4>养护记录</h4>
                    ${careRecords.length > 0 ? 
                        careRecords.map(record => {
                            // 格式化时间戳，只显示时间部分，避免与日期重复
                            const timestamp = record.timestamp ? new Date(record.timestamp).toLocaleString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                            }) : '';
                            return `
                                <div class="care-item">
                                    <span class="care-type">${careTypeLabels[record.type]}</span>
                                    <span class="care-date">${record.date}</span>
                                    ${timestamp ? `<span class="care-timestamp" style="font-size: 0.85rem; color: #a0aec0; margin-left: 10px;">(${timestamp})</span>` : ''}
                                    ${record.notes ? `<div class="care-notes" style="margin: 8px 0;">${record.notes}</div>` : ''}
                                    ${record.image ? 
                                        `<div class="care-image" style="margin-top: 8px;">
                                            <img class="care-avatar" data-src="${record.image}" src="${record.image}" style="max-width: 100%; max-height: 150px; object-fit: cover; border-radius: 6px; cursor: pointer; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); transition: transform 0.2s ease;" alt="养护记录图片" onclick="app.openImageModal('${record.image}')">
                                        </div>` : ''}
                                </div>
                            `;
                        }).join('') : 
                        '<p style="color: #718096; font-style: italic;">暂无养护记录</p>'
                    }
                </div>
                <div style="margin-top: 15px;">
                    <button class="btn btn-secondary add-care-btn" data-plant-id="${plant.id}">添加养护记录</button>
                    <button class="btn btn-primary edit-plant-btn" data-plant-id="${plant.id}">编辑信息</button>
                    <button class="btn btn-danger delete-plant-btn" data-plant-id="${plant.id}">删除植物</button>
                </div>
            </div>
        `;
    }

    // 打开编辑模态框
    openEditModal(plantId) {
        const plant = this.storage.plants.find(p => p.id === plantId);
        if (plant) {
            // 填充表单数据
            document.getElementById('edit-plant-id').value = plant.id;
            document.getElementById('edit-plant-name').value = plant.name;
            document.getElementById('edit-plant-species').value = plant.species;
            document.getElementById('edit-plant-acquisition-date').value = plant.acquisitionDate;
            document.getElementById('edit-plant-location').value = plant.location || '';
            
            // 显示当前图片
            const currentImageDiv = document.getElementById('current-image');
            if (plant.image) {
                currentImageDiv.innerHTML = `<div style="margin-bottom: 10px;"><strong>当前图片：</strong></div><img src="${plant.image}" style="max-width: 100%; max-height: 200px; border-radius: 6px;" alt="${plant.name}">`;
            } else {
                currentImageDiv.innerHTML = '<div style="margin-bottom: 10px;"><strong>当前图片：</strong>无</div>';
            }
            
            // 清空预览
            document.getElementById('edit-image-preview').innerHTML = '';
            document.getElementById('edit-plant-image').value = '';
            
            // 打开模态框
            document.getElementById('edit-modal').style.display = 'block';
        }
    }

    // 绑定卡片事件
    bindCardEvents() {
        // 添加养护记录按钮
        document.querySelectorAll('.add-care-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plantId = e.target.dataset.plantId;
                this.openModal(plantId);
            });
        });

        // 编辑植物按钮
        document.querySelectorAll('.edit-plant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plantId = e.target.dataset.plantId;
                this.openEditModal(plantId);
            });
        });

        // 删除植物按钮
        document.querySelectorAll('.delete-plant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plantId = e.target.dataset.plantId;
                if (confirm('确定要删除这株植物吗？相关的养护记录也会被删除。')) {
                    this.storage.deletePlant(plantId);
                    this.renderPlants();
                }
            });
        });
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PlantApp();
    window.app = app; // 将app实例设置为全局变量，供onclick事件调用
});
