import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRepository } from '../services/repositoryService';
import { useFlashMessage } from '../hooks/useFlashMessage';

export default function NewRepository() {
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { showMessage } = useFlashMessage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showMessage('Repository name is required!', 'danger');
      return;
    }

    try {
      // const newRepo = await createRepository(name);
      showMessage(`Repository "${name}" created successfully!`, 'success');
      navigate('/repository');
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create repository', 'danger');
    }
  };

  return (
    <div>
      <h1>Create New Repository</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Repository Name</label>
          <input
            type="text"
            className="form-control"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Create Repository</button>
        <button type="button" onClick={() => navigate('/repository')} className="btn btn-secondary ml-2">Cancel</button>
      </form>
    </div>
  );
}