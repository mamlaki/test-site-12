class TaskManager {
  constructor() {
    this.tasks = [];
    this.loadTasks();
  }

  loadTasks() {
    try {
      const savedTasks = localStorage.getItem('tasks');
      if (savedTasks) {
        this.tasks = JSON.parse(savedTasks);
        this.tasks.forEach(task => {
          task.isRunning = false;
          task.lastStarted = null;
        });
      }
    } catch (error) {
      console.error('Error loading tasks: ', error);
      this.tasks = [];
    }
  }

  saveTasks() {
    try { 
      localStorage.setItem('tasks', JSON.stringify(this.tasks));
    } catch (error) {
      console.log('Error saving tasks: ', error);
    }
  }

  addTask(taskDetails) {
    if (!taskDetails.title) {
      throw new Error('Task title is required');
    }

    const task = {
      id: Date.now().toString(),
      title: taskDetails.title.trim(),
      description: taskDetails.description?.trim() || "",
      category: taskDetails.category || "work",
      timeSpent: 0,
      isRunning: false,
      created: new Date().toISOString(),
      completed: false,
      lastStarted: null
    };

    this.tasks.unshift(task);
    this.saveTasks();
    return task;
  }

  deleteTask(taskId) {
    const index = this.tasks.findIndex(task => task.id === taskId);
    if (index !== -1) {
      this.tasks.splice(index, 1);
      this.saveTasks();
      return true;
    }
    return false;
  }

  toggleTimer(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (!task || task.completed) {
      return false;
    }

    this.tasks.forEach(task => {
      if (task.id !== taskId && task.isRunning) {
        task.isRunning = false;
        task.lastStarted = null;
      }
    });

    task.isRunning = !task.isRunning;
    task.lastStarted = task.isRunning ? Date.now() : null;
    this.saveTasks();
    return true;
  }

  updateTaskTime(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task?.isRunning && task.lastStarted) {
      const now = Date.now();
      const elapsed = Math.floor((now - task.lastStarted) / 1000);

      task.timeSpent += elapsed;
      task.lastStarted = now;
      this.saveTasks();
      return task.timeSpent;
    }
    return null;
  }
  
  toggleComplete(taskId) {
    const task = this.tasks.find(task => task.id === taskId);
    if (task) {
      task.completed = !task.completed;
      if (task.completed && task.isRunning) {
        task.isRunning = false;
        task.lastStarted = null;
      }
      this.saveTasks();
      return true;
    }
    return false;
  }

  getStats() {
    const stats = {
      total: this.tasks.length,
      completed: this.tasks.filter(tasks => task.completed).length,
      totalTime: this.tasks.reduce((acc, task) => acc + task.timeSpent, 0),
      active: this.tasks.filter(task => !task.completed).length
    };

    stats.completionRate = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

    return stats;
  }
}

// FOR DEV TESTING PURPOSES
document.addEventListener('DOMContentLoaded', () => {
  window.taskManager = new TaskManager();
  console.log('TaskManager loaded');
})