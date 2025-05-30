import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Paper, Repository } from '../types/models';
import { fetchRepository, uploadPaper, deletePaper } from '../services/repositoryService';
import { useFlashMessage } from '../hooks/useFlashMessage';

export default function RepositoryDetail() {
  const { repoId } = useParams<{ repoId: string }>();
  const [repository, setRepository] = useState<Repository | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();
  const { showMessage } = useFlashMessage();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const loadRepository = async () => {
      try {
        const data = await fetchRepository(Number(repoId));
        setRepository(data);
        setPapers(data.papers || []);
      } catch (error) {
        showMessage('Failed to load repository', 'danger');
        navigate('/repository');
      }
    };
    loadRepository();
  }, [repoId, navigate, showMessage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      showMessage('Please select a file', 'danger');
      return;
    }

    try {
      const paperTitle = title.trim() || file.name.split('.')[0];
      const newPaper = await uploadPaper(Number(repoId), paperTitle, file);
      setPapers([...papers, newPaper]);
      showMessage(`Paper "${paperTitle}" uploaded successfully!`, 'success');
      setTitle('');
      setFile(null);
      setShowModal(false);
    } catch (error) {
      showMessage(error instanceof Error ? error.message : 'Failed to upload paper', 'danger');
    }
  };

  const handleDeletePaper = async (paperId: number, paperTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${paperTitle}"?`)) {
      try {
        await deletePaper(paperId);
        setPapers(papers.filter(paper => paper.id !== paperId));
        showMessage(`Paper "${paperTitle}" deleted successfully!`, 'success');
      } catch (error) {
        showMessage('Failed to delete paper', 'danger');
      }
    }
  };

  if (!repository) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h1>{repository.name}</h1>
        <button className="btn btn-success" onClick={() => setShowModal(true)}>
          Upload New Paper
        </button>
      </div>
      <p><Link to="/repository">« Back to Repositories</Link></p>

      {papers.length > 0 ? (
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
            {papers.map(paper => (
              <tr key={paper.id}>
                <td><Link to={`/repository/paper/${paper.id}`}>{paper.title}</Link></td>
                <td>{paper.original_filename}</td>
                <td>{new Date(paper.uploaded_at).toLocaleString()}</td>
                <td>{paper.last_opened ? new Date(paper.last_opened).toLocaleString() : 'Never'}</td>
                <td>{paper.last_page_seen ?? 'N/A'}</td>
                <td>
                  <Link to={`/repository/paper/${paper.id}`} className="btn btn-sm btn-info mr-2">View/Edit</Link>
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

      {showModal && (
        <div className="modal fade show" style={{ display: 'block' }} role="dialog" aria-labelledby="uploadModalLabel">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="uploadModalLabel">Upload Paper to "{repository.name}"</h5>
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
                      onChange={handleFileChange}
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
      )}
      {showModal && <div className="modal-backdrop fade show"></div>}
    </div>
  );
}