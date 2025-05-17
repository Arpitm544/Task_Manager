import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const API_URL = 'http://localhost:5000/api';

function TaskBoard() {
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'todo',
    dueDate: '',
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(`${API_URL}/tasks`, getAuthHeaders());
      setTasks(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert('Error fetching tasks');
      }
    }
  };

  const handleInputChange = (e) => {
    setNewTask({
      ...newTask,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/tasks`, newTask, getAuthHeaders());
      fetchTasks();
      setNewTask({
        title: '',
        description: '',
        status: 'todo',
        dueDate: '',
      });
      alert('Task created successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert('Error creating task');
      }
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await axios.patch(`${API_URL}/tasks/${taskId}`, { status: newStatus }, getAuthHeaders());
      fetchTasks();
      alert('Task status updated');
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert('Error updating task status');
      }
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API_URL}/tasks/${taskId}`, getAuthHeaders());
      fetchTasks();
      alert('Task deleted successfully');
    } catch (error) {
      if (error.response?.status === 401) {
        handleLogout();
      } else {
        alert('Error deleting task');
      }
    }
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const getStatusLabel = (status) => {
    return {
      'todo': 'To Do',
      'in-progress': 'In Progress',
      'done': 'Done'
    }[status];
  };

  return (
    <div className="task-board">
      <div className="task-board">
  <div className="task-board-header">
    <h1 className="task-board-title">Task Board</h1>
    <button onClick={handleLogout} className="logout-button">Logout</button>
  </div>
</div>

      <div className="add-task-form">
        <h2>Add New Task</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={newTask.status}
              onChange={handleInputChange}
            >
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />
          </div>
          <button type="submit" className="button button-primary">Create Task</button>
        </form>
      </div>

      <div className="columns-container" >
        {['todo', 'in-progress', 'done'].map((status) => (
          <div key={status} className="column">
            <div className="column-header">
              <h2 style={{color: 'green'}}>{getStatusLabel(status)}</h2>
            </div>
            <div>
              {getTasksByStatus(status).map((task) => (
                <div key={task._id} >
                  <div>
                    <h3>{task.title}</h3>
                    <button style={{color: 'red', backgroundColor: 'white', border: '1px solid red', borderRadius: '5px', padding: '5px 10px', cursor: 'pointer'}}
                      onClick={() => handleDeleteTask(task._id)}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="task-description">{task.description}</p>
                  {task.dueDate && (
                    <div>
                      <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div>
                    {status !== 'done' && (
                      <button
                        className="button button-secondary"
                        onClick={() =>
                          handleStatusChange(
                            task._id,
                            status === 'todo' ? 'in-progress' : 'done'
                          )
                        }
                      >
                        Move to {status === 'todo' ? 'In Progress' : 'Done'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default TaskBoard; 
