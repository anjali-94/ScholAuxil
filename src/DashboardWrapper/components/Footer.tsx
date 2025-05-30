export default function Footer() {
  return (
    <footer className="footer mt-auto py-3 bg-light fixed-bottom">
      <div className="container text-center">
        <span className="text-muted">
          Research Repository System &copy; {new Date().getFullYear()}
        </span>
      </div>
    </footer>
  );
}