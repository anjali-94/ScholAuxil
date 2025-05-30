import { useForm, ValidationError } from '@formspree/react';

const ContactForm = () => {
  const [state, handleSubmit] = useForm("xdkgeqay");

  if (state.succeeded) {
    return <p className="text-center text-green-600 text-lg">Thanks for contacting us!</p>;
  }

  return (
    <div className="flex justify-center pt-16"> 
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 w-full max-w-2xl"> {/* Wider form */}
        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700 mb-2">Your Name</label>
          <input
            id="name"
            type="text"
            name="name"
            required
            placeholder="John Doe"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <ValidationError prefix="Name" field="name" errors={state.errors} />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 mb-2">Your Email</label>
          <input
            id="email"
            type="email"
            name="email"
            required
            placeholder="your@email.com"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <ValidationError prefix="Email" field="email" errors={state.errors} />
        </div>

        <div className="mb-6">
          <label htmlFor="message" className="block text-gray-700 mb-2">Your Message</label>
          <textarea
            id="message"
            name="message"
            rows={6}
            required
            placeholder="Type your message here..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <ValidationError prefix="Message" field="message" errors={state.errors} />
        </div>

        <button
          type="submit"
          disabled={state.submitting}
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition duration-200"
        >
          Send Message
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
