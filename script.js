// 任务数组，用于存储所有任务
let tasks = [];
let currentTaskId = 0;
let sortDirection = 'asc'; // 'asc' 或 'desc'

// DOM 元素
const taskTable = document.getElementById('task-table');
const taskList = document.getElementById('task-list');
const addTaskBtn = document.getElementById('add-task-btn');
const taskModal = document.getElementById('task-modal');
const taskDetailsModal = document.getElementById('task-details-modal');
const confirmModal = document.getElementById('confirm-modal');
const overlay = document.getElementById('overlay');
const taskForm = document.getElementById('task-form');
const modalTitle = document.getElementById('modal-title');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const taskFilter = document.getElementById('task-filter');
const sortBtn = document.getElementById('sort-btn');
const noTasksMessage = document.getElementById('no-tasks-message');
const currentTimeElement = document.getElementById('current-time');

// 按钮
const closeBtn = document.querySelector('.close-btn');
const closeDetailsBtn = document.querySelector('.close-details-btn');
const cancelBtn = document.getElementById('cancel-btn');
const editFromDetailsBtn = document.getElementById('edit-from-details-btn');
const backBtn = document.getElementById('back-btn');
const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    loadTasksFromLocalStorage();
    renderTasks();
    updateCurrentTime();
    setInterval(updateCurrentTime, 1000); // 每秒更新时间
});

// 更新当前时间
function updateCurrentTime() {
    const now = new Date();
    currentTimeElement.textContent = now.toLocaleString('zh-CN');
}

// 从本地存储加载任务
function loadTasksFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) {
        tasks = JSON.parse(storedTasks);
        // 找到最大ID以便新任务使用
        if (tasks.length > 0) {
            const maxId = Math.max(...tasks.map(task => task.id));
            currentTaskId = maxId + 1;
        }
    }
}

// 保存任务到本地存储
function saveTasksToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// 渲染任务列表
function renderTasks(filteredTasks = null) {
    const tasksToRender = filteredTasks || tasks;
    
    // 显示或隐藏"无任务"消息
    if (tasksToRender.length === 0) {
        noTasksMessage.classList.remove('hidden');
        taskTable.classList.add('hidden');
    } else {
        noTasksMessage.classList.add('hidden');
        taskTable.classList.remove('hidden');
    }
    
    // 清空当前列表
    taskList.innerHTML = '';
    
    // 添加任务到列表
    tasksToRender.forEach(task => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${task.name}</td>
            <td><span class="priority-${task.priority}">${getPriorityText(task.priority)}</span></td>
            <td><span class="status-${task.status}">${getStatusText(task.status)}</span></td>
            <td>${task.deadline ? formatDate(task.deadline) : '无截止日期'}</td>
            <td>
                <div class="task-actions">
                    <button class="btn-action btn-view" data-id="${task.id}" title="查看详情"><i class="fas fa-eye"></i></button>
                    <button class="btn-action btn-edit" data-id="${task.id}" title="编辑任务"><i class="fas fa-edit"></i></button>
                    <button class="btn-action btn-delete" data-id="${task.id}" title="删除任务"><i class="fas fa-trash-alt"></i></button>
                </div>
            </td>
        `;
        taskList.appendChild(row);
    });
    
    // 添加事件监听器
    addTaskActionListeners();
}

// 添加任务操作按钮的事件监听器
function addTaskActionListeners() {
    // 查看按钮
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = parseInt(btn.getAttribute('data-id'));
            viewTaskDetails(taskId);
        });
    });
    
    // 编辑按钮
    document.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = parseInt(btn.getAttribute('data-id'));
            openEditTaskModal(taskId);
        });
    });
    
    // 删除按钮
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', () => {
            const taskId = parseInt(btn.getAttribute('data-id'));
            openConfirmDeleteModal(taskId);
        });
    });
}

// 获取优先级文本
function getPriorityText(priority) {
    switch (priority) {
        case 'high': return '高';
        case 'medium': return '中';
        case 'low': return '低';
        default: return '未设置';
    }
}

// 获取状态文本
function getStatusText(status) {
    switch (status) {
        case 'pending': return '待处理';
        case 'in-progress': return '进行中';
        case 'completed': return '已完成';
        default: return '未设置';
    }
}

// 格式化日期
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN');
}

// 打开添加任务模态框
addTaskBtn.addEventListener('click', () => {
    openAddTaskModal();
});

function openAddTaskModal() {
    modalTitle.textContent = '添加新任务';
    taskForm.reset();
    document.getElementById('task-id').value = '';
    openModal(taskModal);
}

// 打开编辑任务模态框
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    modalTitle.textContent = '编辑任务';
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-name').value = task.name;
    document.getElementById('task-description').value = task.description || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-status').value = task.status;
    document.getElementById('task-deadline').value = task.deadline || '';
    
    openModal(taskModal);
}

// 查看任务详情
function viewTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const detailsContent = document.getElementById('task-details-content');
    detailsContent.innerHTML = `
        <div class="detail-item">
            <div class="detail-label">任务名称</div>
            <div class="detail-value">${task.name}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">任务描述</div>
            <div class="detail-value detail-description">${task.description || '无描述'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">优先级</div>
            <div class="detail-value"><span class="priority-${task.priority}">${getPriorityText(task.priority)}</span></div>
        </div>
        <div class="detail-item">
            <div class="detail-label">状态</div>
            <div class="detail-value"><span class="status-${task.status}">${getStatusText(task.status)}</span></div>
        </div>
        <div class="detail-item">
            <div class="detail-label">截止日期</div>
            <div class="detail-value">${task.deadline ? formatDate(task.deadline) : '无截止日期'}</div>
        </div>
        <div class="detail-item">
            <div class="detail-label">创建时间</div>
            <div class="detail-value">${formatDate(task.createdAt)}</div>
        </div>
    `;
    
    // 为编辑按钮添加任务ID
    editFromDetailsBtn.setAttribute('data-id', task.id);
    
    openModal(taskDetailsModal);
}

// 打开确认删除模态框
function openConfirmDeleteModal(taskId) {
    confirmDeleteBtn.setAttribute('data-id', taskId);
    openModal(confirmModal);
}

// 打开模态框
function openModal(modal) {
    modal.classList.remove('hidden');
    overlay.classList.remove('hidden');
}

// 关闭模态框
function closeModal(modal) {
    modal.classList.add('hidden');
    overlay.classList.add('hidden');
}

// 关闭按钮事件
closeBtn.addEventListener('click', () => closeModal(taskModal));
closeDetailsBtn.addEventListener('click', () => closeModal(taskDetailsModal));
cancelBtn.addEventListener('click', () => closeModal(taskModal));
backBtn.addEventListener('click', () => closeModal(taskDetailsModal));
cancelDeleteBtn.addEventListener('click', () => closeModal(confirmModal));

// 点击遮罩层关闭模态框
overlay.addEventListener('click', () => {
    closeModal(taskModal);
    closeModal(taskDetailsModal);
    closeModal(confirmModal);
});

// 从详情页编辑任务
editFromDetailsBtn.addEventListener('click', () => {
    const taskId = parseInt(editFromDetailsBtn.getAttribute('data-id'));
    closeModal(taskDetailsModal);
    openEditTaskModal(taskId);
});

// 表单提交处理
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const taskId = document.getElementById('task-id').value;
    const taskData = {
        name: document.getElementById('task-name').value,
        description: document.getElementById('task-description').value,
        priority: document.getElementById('task-priority').value,
        status: document.getElementById('task-status').value,
        deadline: document.getElementById('task-deadline').value
    };
    
    if (taskId) {
        // 编辑现有任务
        editTask(parseInt(taskId), taskData);
    } else {
        // 创建新任务
        createTask(taskData);
    }
    
    closeModal(taskModal);
});

// 创建新任务
function createTask(taskData) {
    const newTask = {
        id: currentTaskId++,
        ...taskData,
        createdAt: new Date().toISOString().split('T')[0] // 只保留日期部分
    };
    
    tasks.push(newTask);
    saveTasksToLocalStorage();
    renderTasks();
}

// 编辑任务
function editTask(taskId, taskData) {
    const index = tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
        tasks[index] = {
            ...tasks[index],
            ...taskData
        };
        saveTasksToLocalStorage();
        renderTasks();
    }
}

// 删除任务
confirmDeleteBtn.addEventListener('click', () => {
    const taskId = parseInt(confirmDeleteBtn.getAttribute('data-id'));
    deleteTask(taskId);
    closeModal(confirmModal);
});

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasksToLocalStorage();
    renderTasks();
}

// 搜索功能
searchBtn.addEventListener('click', searchTasks);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        searchTasks();
    }
});

function searchTasks() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (!searchTerm) {
        renderTasks();
        return;
    }
    
    const filteredTasks = tasks.filter(task => 
        task.name.toLowerCase().includes(searchTerm) || 
        (task.description && task.description.toLowerCase().includes(searchTerm))
    );
    
    renderTasks(filteredTasks);
}

// 筛选功能
taskFilter.addEventListener('change', filterTasks);

function filterTasks() {
    const filterValue = taskFilter.value;
    
    if (filterValue === 'all') {
        renderTasks();
        return;
    }
    
    const filteredTasks = tasks.filter(task => task.status === filterValue);
    renderTasks(filteredTasks);
}

// 排序功能
sortBtn.addEventListener('click', sortTasks);

function sortTasks() {
    sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    
    tasks.sort((a, b) => {
        // 首先按状态排序：待处理 > 进行中 > 已完成
        const statusOrder = { 'pending': 0, 'in-progress': 1, 'completed': 2 };
        const statusCompare = statusOrder[a.status] - statusOrder[b.status];
        
        if (statusCompare !== 0) return statusCompare;
        
        // 然后按优先级排序：高 > 中 > 低
        const priorityOrder = { 'high': 0, 'medium': 1, 'low': 2 };
        const priorityCompare = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityCompare !== 0) return priorityCompare;
        
        // 最后按截止日期排序
        if (a.deadline && b.deadline) {
            return new Date(a.deadline) - new Date(b.deadline);
        } else if (a.deadline) {
            return -1;
        } else if (b.deadline) {
            return 1;
        }
        
        return 0;
    });
    
    // 如果是降序，则反转数组
    if (sortDirection === 'desc') {
        tasks.reverse();
    }
    
    renderTasks();
}
