import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Paper } from '../types/models';
import { fetchPaper, updatePaper, deletePaper } from '../services/paperService';
import { useFlashMessage } from '../hooks/useFlashMessage';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export default function PaperDetail() {
  const { paperId } = useParams<{ paperId: string }>();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [notes, setNotes] = useState('');
  const [lastPageSeen, setLastPageSeen] = useState<string>('');
  const navigate = useNavigate();
  const { showMessage } = useFlashMessage();

  useEffect(() => {
    const loadPaper = async () => {
      try {
        const data = await fetchPaper(Number(paperId));
        setPaper(data);
        setNotes(data.notes || '');
        setLastPageSeen(data.last_page_seen?.toString() || '');
      } catch (error) {
        showMessage('Failed to load paper', 'danger');
        navigate('/repository');
      }
    };
    loadPaper();
  }, [paperId, navigate, showMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paper) return;

    try {
      const updatedPaper = await updatePaper(paper.id, {
        notes,
        last_page_seen: lastPageSeen ? parseInt(lastPageSeen) : null,
      });
      setPaper(updatedPaper);
      showMessage('Paper details updated!', 'success');
    } catch (error) {
      showMessage('Failed to update paper', 'danger');
    }
  };

  const handleDelete = async () => {
    if (!paper) return;
    if (window.confirm(`Are you sure you want to delete "${paper.title}"?`)) {
      try {
        await deletePaper(paper.id);
        showMessage(`Paper "${paper.title}" deleted successfully!`, 'success');
        navigate(`/repository/${paper.repository_id}`);
      } catch (error) {
        showMessage('Failed to delete paper', 'danger');
      }
    }
  };

  if (!paper) return <div>Loading...</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center">
        <h1>{paper.title}</h1>
        <Link to={`/repository/${paper.repository_id}`} className="btn btn-sm btn-outline-secondary">
          « Back to {paper.repository?.name}
        </Link>
      </div>
      <hr />

      <div className="row">
        <div className="col-md-8">
          <h4>Paper Details</h4>
          <p><strong>Original Filename:</strong> {paper.original_filename}</p>
          <p><strong>Uploaded:</strong> {new Date(paper.uploaded_at).toLocaleString()}</p>
          <p><strong>Last Opened:</strong> {paper.last_opened ? new Date(paper.last_opened).toLocaleString() : 'Never'}</p>

          {paper.filepath && (
            <>
              <p>
                <a
                  href={`${API_BASE_URL}/uploads/${paper.filepath}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  Open Paper ({paper.filepath.split('.').pop()?.toUpperCase()})
                </a>
              </p>
              <p className="text-muted small">
                Note: "Last Page Seen" is manually updated below. For automatic page tracking within the PDF,
                you would need a browser extension or a more advanced client-side PDF viewer integrated into this page.
              </p>

              {paper.filepath.toLowerCase().endsWith('.pdf') && (
                <div className="mt-3 mb-3">
                  <h5>Embedded PDF Viewer (Basic)</h5>
                  <iframe
                    src={`${API_BASE_URL}/uploads/${paper.filepath}`}
                    width="100%"
                    height="600px"
                    style={{ border: '1px solid #ddd' }}
                    title={paper.title}
                  >
                    Your browser does not support iframes. Please{' '}
                    <a href={`${API_BASE_URL}/uploads/${paper.filepath}`} target="_blank" rel="noopener noreferrer">
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
          <form onSubmit={handleSubmit}>
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
      <button onClick={handleDelete} className="btn btn-danger mt-3">
        Delete This Paper
      </button>
    </div>
  );
}