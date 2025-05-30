import styled from 'styled-components';
import { FaGraduationCap, FaTasks, FaQuoteRight, FaRobot, FaChevronDown } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ContactForm from './ContactForm';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
import { motion } from 'framer-motion';

// Styled Components
const Header = styled.header`
  background: #fff;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const Nav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const NavLinks = styled.ul`
  list-style: none;
  display: flex;
  gap: 20px;
  align-items: center;
  flex-wrap: wrap;
  justify-content: center;
  padding: 0;

  li a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
  }

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const Logo = styled.div`
  font-size: 24px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 10px;
`;



// const NavLinks = styled.ul`
//   list-style: none;
//   display: flex;
//   gap: 20px;
//   align-items: center;

//   li a {
//     text-decoration: none;
//     color: #333;
//     font-weight: 500;
//   }
// `;

const CtaButton = styled.button`
  background-color: #0077cc;
  color: white;
  padding: 10px 18px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
`;

const Hero = styled.section`
  background: #e0f2fe;
  padding: 80px 20px;
  text-align: center;
`;

const HeroContent = styled.div`
  max-width: 800px;
  margin: auto;

  h1 {
    font-size: 3rem;
    margin-bottom: 20px;
  }

  p {
    font-size: 1.2rem;
    margin-bottom: 30px;
  }
`;

const MainCta = styled.button`
  background: #0077cc;
  color: white;
  padding: 12px 28px;
  font-size: 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
`;

const FeaturesGrid = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 30px;
`;


const StepsContainer = styled.div`
  max-width: 900px;
  margin: auto;
`;

const Step = styled.div`
  display: flex;
  margin-bottom: 40px;
  align-items: center;

  .step-number {
    background: #0077cc;
    color: white;
    font-size: 1.5rem;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .step-content {
    margin-left: 20px;
  }
`;

const FaqItem = styled.div`
  border-bottom: 1px solid #ddd;
  padding: 20px 0;

  .faq-question {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    font-weight: bold;
  }

  .faq-answer {
    margin-top: 10px;
    color: #555;
  }
`;

const faqVariants = {
  hidden: (i: number) => ({
    opacity: 0,
    y: 30,
    x: i % 2 === 0 ? -50 : 50, // Alternate left/right
  }),
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    x: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut",
    },
  }),
};


const Section = styled.section`
  padding: 80px 20px;
  background: #fff;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 50px;

  h2 {
    font-size: 2.5rem;
  }

  p {
    margin-top: 10px;
    color: #666;
  }
`;

const ContactContainer = styled.div`
  min-width: 100%;
  margin: auto;
  padding: 0 20px;
`;

const ContactSectionTitle = styled.div`
  text-align: center;
  margin-bottom: 40px;

  h2 {
    font-size: 2.5rem;
    margin-bottom: 10px;
  }

  p {
    color: #666;
    font-size: 1.1rem;
  }
`;

const Footer = styled.footer`
  background: #333;
  color: white;
  padding: 30px 20px;
  text-align: center;
`;

// Main Component
const LandingPage = () => {
  return (
    <>
      <Header>
        <Nav>
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Logo>
              <FaGraduationCap />
              <span>ScholAuxil</span>
            </Logo>
          </motion.div>

          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <NavLinks>
              <li><a href="#features">Features</a></li>
              {/* <li><a href="#about">About Us</a></li> */}
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#faq">FAQ</a></li>
              <li><a href="#contact">Contact</a></li>
              <li>
                <Link to="/Login">
                  <CtaButton>Login</CtaButton>
                </Link>
              </li>
            </NavLinks>
          </motion.div>
        </Nav>

      </Header>

      <Hero>
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
          whileInView={{ y: 0, opacity: 1 }}
        >
          <HeroContent>

            <h1>Revolutionizing Academic Research</h1>
            <p>ScholAuxil combines powerful tools with intelligent assistance to streamline your research workflow.</p>
            <Link to="/Signup">
              <MainCta>Get Started</MainCta>
            </Link>
          </HeroContent>
        </motion.div>
      </Hero>


      <Section id="features">
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <SectionTitle>
            <h2>Research Tools Designed for Scholars</h2>
            <p>Everything you need to organize and accelerate your academic work</p>
          </SectionTitle>
        </motion.div>

        <FeaturesGrid>
  <motion.div
    initial={{ x: -100, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.1 }}
    viewport={{ once: true }}
    style={{
      background: '#E5E7EB', // light grey background
      color: '#0F172A', // dark slate text
      borderRadius: '16px',
      padding: '35px',
      width: '300px',
      textAlign: 'center',
      boxShadow: '0 6px 16px rgba(56, 189, 248, 0.15)' // sky blue soft shadow
    }}
  >
    <FaTasks size={40} color="#38BDF8" />
    <h3 style={{ marginTop: '16px', fontSize: '20px', fontWeight: '700' }}>Smart To-Do List</h3>
    <p style={{ color: '#6B7280', marginTop: '8px' }}>
      Prioritize and track your research milestones with our intelligent task manager.
    </p>
  </motion.div>

  <motion.div
    initial={{ y: 100, opacity: 0 }}
    whileInView={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    viewport={{ once: true }}
    style={{
      background: '#E5E7EB',
      color: '#0F172A',
      borderRadius: '16px',
      padding: '35px',
      width: '300px',
      textAlign: 'center',
      boxShadow: '0 6px 16px rgba(56, 189, 248, 0.15)'
    }}
  >
    <FaQuoteRight size={40} color="#38BDF8" />
    <h3 style={{ marginTop: '16px', fontSize: '20px', fontWeight: '700' }}>Citation Creator</h3>
    <p style={{ color: '#6B7280', marginTop: '8px' }}>
      Generate flawless citations in any style with support for various sources.
    </p>
  </motion.div>

  <motion.div
    initial={{ x: 100, opacity: 0 }}
    whileInView={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.3 }}
    viewport={{ once: true }}
    style={{
      background: '#E5E7EB',
      color: '#0F172A',
      borderRadius: '16px',
      padding: '35px',
      width: '300px',
      textAlign: 'center',
      boxShadow: '0 6px 16px rgba(56, 189, 248, 0.15)'
    }}
  >
    <FaRobot size={40} color="#38BDF8" />
    <h3 style={{ marginTop: '16px', fontSize: '20px', fontWeight: '700' }}>Research Assistant</h3>
    <p style={{ color: '#6B7280', marginTop: '8px' }}>
      Refine research questions, suggest methodologies, and recommend literature.
    </p>
  </motion.div>
</FeaturesGrid>


      </Section>

      <Section id="how-it-works">

        <SectionTitle>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
          >
            <h2>How ScholAuxil Works</h2>
            <p>Simple steps to transform your research process</p>
          </motion.div>
        </SectionTitle>


        <StepsContainer>
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ x: index % 2 === 0 ? -100 : 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Step>
                <div className="step-number">{index + 1}</div>
                <div className="step-content">
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </Step>
            </motion.div>
          ))}
        </StepsContainer>

      </Section>

      <Section id="faq" style={{
        backgroundColor: "#f0f4f8"
      }}>
        <SectionTitle>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
          >
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about ScholAuxil</p>
          </motion.div>
        </SectionTitle>

        <div>
          {faqItems.map((faq, index) => (
            <motion.div
              key={index}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={faqVariants}
            >
              <FaqItem key={index}>
                <div className="faq-question">
                  <span>{faq.question}</span>
                  <FaChevronDown />
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </FaqItem>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="contact">
        <ContactContainer>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
          >
            <ContactSectionTitle>
              <h2>Contact Our Team</h2>
              <p>Have questions or feedback? We're here to help</p>
            </ContactSectionTitle>
          </motion.div>
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.6 }}
          >
            <ContactForm />
          </motion.div>
        </ContactContainer>

      </Section>



      <Footer>
        <p>© 2025 ScholAuxil. All rights reserved.</p>
      </Footer>
    </>
  );
};


//Mock Data
const steps = [
  { title: "Create Your Academic Profile", description: "Personalize ScholAuxil tools to your specific needs." },
  { title: "Organize Your Projects", description: "Break projects into manageable tasks with suggested timelines." },
  { title: "Utilize Research Tools", description: "Generate citations, get suggestions, and track your progress." },
  { title: "Export & Share", description: "Easily export your research notes, tasks, and references." }
];

const faqItems = [
  { question: "Is my research data secure with ScholAuxil?", answer: "Absolutely. We use enterprise-grade encryption for all data." },
  { question: "Can I import references from other citation managers?", answer: "Yes, we support importing from Zotero, Mendeley, and EndNote." },
  { question: "How does the AI research assistant differ from general chatbots?", answer: "Our assistant understands academic literature and methodologies." },
  { question: "Is there a mobile app available?", answer: "Yes, native apps are in development, but the web platform is fully responsive." }
];

export default LandingPage;


































