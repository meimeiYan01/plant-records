// 多肉养殖记录应用 - JavaScript 逻辑

// 数据存储类
class PlantStorage {
    constructor() {
        this.plants = this.loadPlants();
        this.careRecords = this.loadCareRecords();
        this.reminders = this.loadReminders();
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

    // 加载养护提醒
    loadReminders() {
        const reminders = localStorage.getItem('reminders');
        return reminders ? JSON.parse(reminders) : [];
    }

    // 保存养护提醒
    saveReminders() {
        localStorage.setItem('reminders', JSON.stringify(this.reminders));
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
        this.reminders = this.reminders.filter(reminder => reminder.plantId !== plantId);
        this.savePlants();
        this.saveCareRecords();
        this.saveReminders();
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

    // 导出所有数据
    exportAllData() {
        return {
            plants: this.plants,
            careRecords: this.careRecords,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
    }

    // 导入数据
    importData(data) {
        if (data.plants && Array.isArray(data.plants)) {
            this.plants = data.plants;
            this.savePlants();
        }
        if (data.careRecords && Array.isArray(data.careRecords)) {
            this.careRecords = data.careRecords;
            this.saveCareRecords();
        }
        if (data.reminders && Array.isArray(data.reminders)) {
            this.reminders = data.reminders;
            this.saveReminders();
        }
    }

    // 添加养护提醒
    addReminder(reminder) {
        const newReminder = {
            id: Date.now().toString(),
            ...reminder
        };
        this.reminders.push(newReminder);
        this.saveReminders();
        return newReminder;
    }

    // 获取植物的养护提醒
    getRemindersByPlantId(plantId) {
        return this.reminders.filter(reminder => reminder.plantId === plantId);
    }

    // 获取所有到期的提醒
    getDueReminders() {
        const today = new Date().toISOString().split('T')[0];
        return this.reminders.filter(reminder => reminder.nextDate <= today);
    }

    // 删除养护提醒
    deleteReminder(reminderId) {
        this.reminders = this.reminders.filter(reminder => reminder.id !== reminderId);
        this.saveReminders();
    }

    // 更新提醒的下次日期
    updateReminderNextDate(reminderId, nextDate) {
        const reminder = this.reminders.find(r => r.id === reminderId);
        if (reminder) {
            reminder.nextDate = nextDate;
            this.saveReminders();
            return reminder;
        }
        return null;
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
        this.checkDueReminders();
    }

    // 检查到期的提醒
    checkDueReminders() {
        const dueReminders = this.storage.getDueReminders();
        if (dueReminders.length > 0) {
            const plantNames = new Map();
            this.storage.plants.forEach(plant => {
                plantNames.set(plant.id, plant.name);
            });

            const reminderMessages = dueReminders.map(reminder => {
                const plantName = plantNames.get(reminder.plantId) || '未知植物';
                const reminderType = this.getReminderTypeLabel(reminder.type);
                return `${plantName} 需要${reminderType}了！`;
            });

            if (reminderMessages.length > 0) {
                alert(`📢 养护提醒：\n${reminderMessages.join('\n')}`);
            }
        }
    }

    // 获取提醒类型的中文标签
    getReminderTypeLabel(type) {
        const labels = {
            water: '浇水',
            fertilize: '施肥',
            repot: '换盆',
            prune: '修剪'
        };
        return labels[type] || type;
    }

    // 绑定事件
    bindEvents() {
        // 导出数据按钮事件
        const exportBtn = document.getElementById('export-data-btn');
        exportBtn.addEventListener('click', () => {
            this.exportData();
        });

        // 导入数据按钮事件
        const importBtn = document.getElementById('import-data-btn');
        const importFileInput = document.getElementById('import-file-input');
        
        importBtn.addEventListener('click', () => {
            importFileInput.click();
        });

        importFileInput.addEventListener('change', (e) => {
            this.handleImportData(e);
        });

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

        // 养护提醒表单提交
        document.getElementById('reminder-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddReminder(e);
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
                <div style="margin-top: 15px; display: flex; flex-wrap: wrap; gap: 8px;">
                    <button class="btn btn-secondary add-care-btn" data-plant-id="${plant.id}">添加养护记录</button>
                    <button class="btn btn-primary edit-plant-btn" data-plant-id="${plant.id}">编辑信息</button>
                    <button class="btn btn-warning set-reminder-btn" data-plant-id="${plant.id}">设置提醒</button>
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

        // 设置提醒按钮
        document.querySelectorAll('.set-reminder-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plantId = e.target.dataset.plantId;
                this.openReminderModal(plantId);
            });
        });

        // 删除植物按钮
        document.querySelectorAll('.delete-plant-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const plantId = e.target.dataset.plantId;
                if (confirm('确定要删除这株植物吗？相关的养护记录和提醒也会被删除。')) {
                    this.storage.deletePlant(plantId);
                    this.renderPlants();
                }
            });
        });
    }

    // 打开养护提醒模态框
    openReminderModal(plantId) {
        document.getElementById('reminder-plant-id').value = plantId;
        
        // 设置默认的下次提醒日期为明天
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('reminder-next-date').value = tomorrow.toISOString().split('T')[0];
        
        document.getElementById('reminder-modal').style.display = 'block';
    }

    // 处理添加养护提醒
    handleAddReminder(e) {
        const form = e.target;
        const formData = new FormData(form);
        const reminder = {
            plantId: formData.get('plantId'),
            type: formData.get('type'),
            interval: parseInt(formData.get('interval')),
            nextDate: formData.get('nextDate')
        };

        this.storage.addReminder(reminder);
        this.closeReminderModal();
        this.renderPlants();
    }

    // 关闭养护提醒模态框
    closeReminderModal() {
        const modal = document.getElementById('reminder-modal');
        const form = document.getElementById('reminder-form');
        modal.style.display = 'none';
        form.reset();
    }

    // 导出数据
    exportData() {
        const data = this.storage.exportAllData();
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `多肉养殖记录_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // 处理数据导入
    handleImportData(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.name.endsWith('.json')) {
            alert('请选择JSON格式的文件');
            return;
        }

        if (confirm('导入数据将覆盖当前所有数据，确定要继续吗？')) {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    this.storage.importData(data);
                    this.renderPlants();
                    alert('数据导入成功！');
                } catch (error) {
                    alert('数据导入失败，请检查文件格式是否正确。');
                    console.error('导入数据错误:', error);
                }
            };
            reader.readAsText(file);
        }

        // 重置文件输入
        e.target.value = '';
    }
}

// 初始化应用
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new PlantApp();
    window.app = app; // 将app实例设置为全局变量，供onclick事件调用
});
