import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Repository } from '../types/models';
import { fetchRepositories, deleteRepository } from '../services/repositoryService';
import { useFlashMessage } from '../hooks/useFlashMessage';

export default function Home() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const { showMessage } = useFlashMessage();

  useEffect(() => {
    const loadRepositories = async () => {
      try {
        const data = await fetchRepositories();
        setRepositories(data);
      } catch (error) {
        showMessage('Failed to load repositories', 'danger');
      }
    };
    loadRepositories();
  }, [showMessage]);

  const handleDelete = async (repoId: number, repoName: string) => {
    if (window.confirm(`Are you sure you want to delete "${repoName}" and all its papers?`)) {
      try {
        await deleteRepository(repoId);
        setRepositories(repositories.filter(repo => repo.id !== repoId));
        showMessage(`Repository "${repoName}" and all its papers deleted successfully!`, 'success');
      } catch (error) {
        showMessage('Failed to delete repository', 'danger');
      }
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Repositories</h1>
        <Link to="/repository/new" className="btn btn-success">Create New Repository</Link>
      </div>

      {repositories.length > 0 ? (
        <ul className="list-group">
          {repositories.map(repo => (
            <li key={repo.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <Link to={`/repository/${repo.id}`}>
                  <h5>{repo.name}</h5>
                </Link>
                <small className="text-muted">
                  Created: {new Date(repo.created_at).toLocaleString()} | Papers: {repo.papers?.length || 0}
                </small>
              </div>
              <button
                onClick={() => handleDelete(repo.id, repo.name)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No repositories found. <Link to="/repository/new">Create one now!</Link>
        </p>
      )}
    </div>
  );
}