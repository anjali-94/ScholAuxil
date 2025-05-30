// src/components/Repository.tsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { Repository, Paper } from './types/models';
import { useFlashMessage } from './hooks/useFlashMessage';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FlashMessage from './components/FlashMessage';
import { apiClient } from './apiClient.tsx'; 

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function Repository() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<'home' | 'new' | 'repoDetail' | 'paperDetail'>('home');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [currentRepo, setCurrentRepo] = useState<Repository | null>(null);
  const [currentPaper, setCurrentPaper] = useState<Paper | null>(null);
  const [name, setName] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [lastPageSeen, setLastPageSeen] = useState('');
  const [showModal, setShowModal] = useState(false);
  const { message, type, showMessage, clearMessage } = useFlashMessage();

  // Determine view based on URL parameters
  useEffect(() => {
    const repoId = searchParams.get('repoId');
    const paperId = searchParams.get('paperId');
    const newParam = searchParams.get('new');
    if (paperId) {
      setView('paperDetail');
    } else if (repoId) {
      setView('repoDetail');
    } else if (newParam === 'true') {
      setView('new');
    } else {
      setView('home');
    }
  }, [searchParams]);

  // Load repositories for home view
  useEffect(() => {
    if (view === 'home') {
      const loadRepositories = async () => {
        try {
          const client = await apiClient(); // get authenticated axios instance
          const response = await client.get('/repositories');
          setRepositories(response.data);
        } catch (error) {
          showMessage('Failed to load repositories', 'danger');
        }
      };
      loadRepositories();
    }
  }, [view, showMessage]);

  // Load repository details
  useEffect(() => {
    if (view === 'repoDetail') {
      const repoId = searchParams.get('repoId');
      if (repoId) {
        const loadRepository = async () => {
          try {
            const client = await apiClient(); // Get authenticated Axios instance
            const response = await client.get('/repository/' + Number(repoId));
            setCurrentRepo(response.data);
          } catch (error) {
            showMessage('Failed to load repository', 'danger');
            setSearchParams({});
          }
        };
        loadRepository();
      }
    }
  }, [view, searchParams, showMessage, setSearchParams]);

  // Load paper details
  useEffect(() => {
    if (view === 'paperDetail') {
      const paperId = searchParams.get('paperId');
      if (paperId) {
        const loadPaper = async () => {
          try {
            const client = await apiClient(); // Get authenticated Axios instance
            const response = await client.get(`/paper/${Number(paperId)}`); // Use correct endpoint
            const data = response.data;
            setCurrentPaper(data);
            setNotes(data.notes || '');
            setLastPageSeen(data.last_page_seen?.toString() || '');
          } catch (error) {
            showMessage('Failed to load paper', 'danger');
            setSearchParams({});
          }
        };
        loadPaper();
      }
    }
  }, [view, searchParams, showMessage, setSearchParams]);

  // Handle new repository creation
  const handleCreateRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showMessage('Repository name is required!', 'danger');
      return;
    }
    try {
      const client = await apiClient(); // Get the authenticated Axios instance
      const response = await client.post('/repository/new', { name }); // Assuming the API expects { name }
      const newRepo = response.data;
      
      showMessage(`Repository "${name}" created successfully!`, 'success');
      setRepositories([...repositories, newRepo]);
      setName('');
      setSearchParams({}); // Return to home view
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to create repository', 'danger');
    }
  };

  // Handle repository deletion
  const handleDeleteRepo = async (repoId: number, repoName: string) => {
    if (window.confirm(`Are you sure you want to delete "${repoName}" and all its papers?`)) {
      try {
        const client = await apiClient(); // Get the authenticated Axios instance
        await client.delete(`/repository/${repoId}`); // Assuming this is the correct DELETE endpoint

        setRepositories(repositories.filter(repo => repo.id !== repoId));
        showMessage(`Repository "${repoName}" and all its papers deleted successfully!`, 'success');
      } catch (error) {
        showMessage('Failed to delete repository', 'danger');
      }
    }
  };

  // Handle paper upload
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !currentRepo) {
      showMessage('Please select a file', 'danger');
      return;
    }
    try {
      const paperTitle = title.trim() || file.name.split('.')[0];

      const formData = new FormData();
      formData.append('title', paperTitle);
      formData.append('file', file);

      const client = await apiClient(); // Get the authenticated Axios instance
      const response = await client.post(`/repository/${currentRepo.id}/papers`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const newPaper = response.data;

      setCurrentRepo({
        ...currentRepo,
        papers: [...(currentRepo.papers || []), newPaper],
      });
      showMessage(`Paper "${paperTitle}" uploaded successfully!`, 'success');
      setTitle('');
      setFile(null);
      setShowModal(false);
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : 'Failed to upload paper',
        'danger'
      );
    }
  };


  // Handle paper deletion
  const handleDeletePaper = async (paperId: number, paperTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${paperTitle}"?`)) {
      try {
        const client = await apiClient(); // Get authenticated Axios instance
        await client.delete(`/paper/${paperId}`); // Assuming this is your API route

        if (currentRepo) {
          setCurrentRepo({
            ...currentRepo,
            papers: (currentRepo.papers || []).filter(paper => paper.id !== paperId)
          });
        }
        showMessage(`Paper "${paperTitle}" deleted successfully!`, 'success');
        if (view === 'paperDetail') {
          setSearchParams({ repoId: currentRepo?.id.toString() || '' });
        }
      } catch (error) {
        showMessage('Failed to delete paper', 'danger');
      }
    }
  };

  // Handle paper update
  const handleUpdatePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPaper) return;
    try {
      const client = await apiClient(); // Get authenticated Axios instance

      const response = await client.patch(`/paper/${currentPaper.id}`, {
        notes,
        last_page_seen: lastPageSeen ? parseInt(lastPageSeen) : null,
      });

      const updatedPaper = response.data;
      setCurrentPaper(updatedPaper);
      showMessage('Paper details updated!', 'success');
    } catch (error) {
      showMessage('Failed to update paper', 'danger');
    }
  };


  // Render Home View (List of Repositories)
  const renderHome = () => (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>Repositories</h1>
        <button onClick={() => setSearchParams({ new: 'true' })} className="btn btn-success">
          Create New Repository
        </button>
      </div>
      {repositories.length > 0 ? (
        <ul className="list-group">
          {repositories.map(repo => (
            <li key={repo.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <Link to={`/repository?repoId=${repo.id}`}>
                  <h5>{repo.name}</h5>
                </Link>
                <small className="text-muted">
                  Created: {new Date(repo.created_at).toLocaleString()} | Papers: {repo.papers?.length || 0}
                </small>
              </div>
              <button
                onClick={() => handleDeleteRepo(repo.id, repo.name)}
                className="btn btn-sm btn-danger"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>
          No repositories found.{' '}
          <button onClick={() => setSearchParams({ new: 'true' })} className="btn btn-link p-0">
            Create one now!
          </button>
        </p>
      )}
    </div>
  );

  // Render New Repository View
  const renderNewRepository = () => (
    <div>
      <h1>Create New Repository</h1>
      <form onSubmit={handleCreateRepo}>
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
        <button type="button" onClick={() => setSearchParams({})} className="btn btn-secondary ml-2">
          Cancel
        </button>
      </form>
    </div>
  );

  // Render Repository Detail View
  const renderRepoDetail = () => {
    if (!currentRepo) return <div>Loading...</div>;
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h1>{currentRepo.name}</h1>
          <button className="btn btn-success" onClick={() => setShowModal(true)}>
            Upload New Paper
          </button>
        </div>
        <p><Link to="/repository">« Back to Repositories</Link></p>
        {currentRepo.papers && currentRepo.papers.length > 0 ? (
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Title</th>
                <th>Original Filename</th>
                <th>Uploaded</th>
                <th>Last Opened</th>
                <th>Last Page</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentRepo.papers.map(paper => (
                <tr key={paper.id}>
                  <td><Link to={`/repository?paperId=${paper.id}`}>{paper.title}</Link></td>
                  <td>{paper.original_filename}</td>
                  <td>{new Date(paper.uploaded_at).toLocaleString()}</td>
                  <td>{paper.last_opened ? new Date(paper.last_opened).toLocaleString() : 'Never'}</td>
                  <td>{paper.last_page_seen ?? 'N/A'}</td>
                  <td>
                    <Link to={`/repository?paperId=${paper.id}`} className="btn btn-sm btn-info mr-2">
                      View/Edit
                    </Link>
                    <button
                      onClick={() => handleDeletePaper(paper.id, paper.title)}
                      className="btn btn-sm btn-danger"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No papers found in this repository.</p>
        )}
        {/* Upload Modal */}
        <div className={`modal fade ${showModal ? 'show' : ''}`} style={{ display: showModal ? 'block' : 'none' }} tabIndex={-1} role="dialog" aria-labelledby="uploadModalLabel" aria-hidden={!showModal}>
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="uploadModalLabel">Upload Paper to "{currentRepo.name}"</h5>
                <button type="button" className="close" onClick={() => setShowModal(false)} aria-label="Close">
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <form onSubmit={handleUpload}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="title">Paper Title (Optional - uses filename if blank)</label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="file">Paper File (PDF, TXT, DOC, DOCX)</label>
                    <input
                      type="file"
                      className="form-control-file"
                      id="file"
                      onChange={(e) => e.target.files && setFile(e.target.files[0])}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">Upload Paper</button>
                </div>
              </form>
            </div>
          </div>
        </div>
        {showModal && <div className="modal-backdrop fade show"></div>}
      </div>
    );
  };

  // Render Paper Detail View
  const renderPaperDetail = () => {
    if (!currentPaper) return <div>Loading...</div>;
    return (
      <div>
        <div className="d-flex justify-content-between align-items-center">
          <h1>{currentPaper.title}</h1>
          <Link to={`/repository?repoId=${currentPaper.repository_id}`} className="btn btn-sm btn-outline-secondary">
            « Back to {currentPaper.repository?.name || 'Repository'}
          </Link>
        </div>
        <hr />
        <div className="row">
          <div className="col-md-8">
            <h4>Paper Details</h4>
            <p><strong>Original Filename:</strong> {currentPaper.original_filename}</p>
            <p><strong>Uploaded:</strong> {new Date(currentPaper.uploaded_at).toLocaleString()}</p>
            <p><strong>Last Opened:</strong> {currentPaper.last_opened ? new Date(currentPaper.last_opened).toLocaleString() : 'Never'}</p>
            {currentPaper.filepath && (
              <>
                <p>
                  <a
                    href={`${API_BASE_URL}/uploads/${currentPaper.filepath}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    Open Paper ({currentPaper.filepath.split('.').pop()?.toUpperCase()})
                  </a>
                </p>
                <p className="text-muted small">
                  Note: "Last Page Seen" is manually updated below. For automatic page tracking within the PDF,
                  you would need a browser extension or a more advanced client-side PDF viewer integrated into this page.
                </p>
                {currentPaper.filepath.toLowerCase().endsWith('.pdf') && (
                  <div className="mt-3 mb-3">
                    <h5>Embedded PDF Viewer (Basic)</h5>
                    <iframe
                      src={`${API_BASE_URL}/uploads/${currentPaper.filepath}`}
                      width="100%"
                      height="600px"
                      style={{ border: '1px solid #ddd' }}
                      title={currentPaper.title}
                    >
                      Your browser does not support iframes. Please{' '}
                      <a href={`${API_BASE_URL}/uploads/${currentPaper.filepath}`} target="_blank" rel="noopener noreferrer">
                        click here to open the PDF
                      </a>.
                    </iframe>
                  </div>
                )}
              </>
            )}
          </div>
          <div className="col-md-4">
            <h4>Notes & Tracking</h4>
            <form onSubmit={handleUpdatePaper}>
              <div className="form-group">
                <label htmlFor="last_page_seen">Last Page Seen</label>
                <input
                  type="number"
                  className="form-control"
                  id="last_page_seen"
                  value={lastPageSeen}
                  onChange={(e) => setLastPageSeen(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={10}
                />
              </div>
              <button type="submit" className="btn btn-success">Save Changes</button>
            </form>
          </div>
        </div>
        <hr />
        <button onClick={() => handleDeletePaper(currentPaper.id, currentPaper.title)} className="btn btn-danger mt-3">
          Delete This Paper
        </button>
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <FlashMessage />
      <div className="container mt-4">
        {view === 'home' && renderHome()}
        {view === 'new' && renderNewRepository()}
        {view === 'repoDetail' && renderRepoDetail()}
        {view === 'paperDetail' && renderPaperDetail()}
      </div>
      <Footer />
    </>
  );
}