import sys
from fpdf import FPDF

class UCABDocumentationPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="portrait", unit="mm", format="A4")
        self.set_margins(20, 20, 20)
        self.set_auto_page_break(auto=False) # We will manage page breaks manually to match reference pages exactly

    def header(self):
        pass

    def footer(self):
        pass

def create_pdf(output_path):
    pdf = UCABDocumentationPDF()
    
    # ------------------ PAGE 1 ------------------
    pdf.add_page()
    
    # Title
    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 7, "Project Documentation - UCAB: Full-Stack Cab Booking &", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.cell(0, 7, "Ride-Hailing Platform", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(5)
    
    # Section 1: Introduction
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "1. Introduction", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    # Project Title
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Project Title: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "UCAB - Full-Stack Cab Booking & Ride-Hailing Platform\n")
    
    # Project Contributors
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Project Contributors: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Niharika Devi Guttula, Madiki Devi, Mahipala Veera Venkata Manikanta, Naveen Kumar Kondepudi, and Konatham Sreevanth\n")
    
    # Contributors detail
    contributors = [
        ("Niharika Devi Guttula", "Team Lead & Full-Stack Developer", 
         "Architected system, designed database schemas, developed JWT authentication, and managed API integration."),
        ("Madiki Devi", "Frontend Developer & UI Designer", 
         "Designed responsive React dashboards for Users/Drivers and styled the application components."),
        ("Mahipala Veera Venkata Manikanta", "Backend Developer & Database Engineer", 
         "Implemented Express REST APIs for ride tracking and support; configured MongoDB Memory Server."),
        ("Naveen Kumar Kondepudi", "Full-stack Developer and Tester", 
         "Verified API endpoints, conducted system integration tests, handled error middleware, and resolved issues."),
        ("Konatham Sreevanth", "Full-stack Developer and Documentation Specialist", 
         "Contributed to full-stack development, conducted system testing, validated workflows, and compiled documentation.")
    ]
    
    for name, role, contrib in contributors:
        pdf.set_font("Helvetica", "B", 9.5)
        pdf.write(4.1, f"{name} - Role: ")
        pdf.set_font("Helvetica", "", 9.5)
        pdf.write(4.1, f"{role}\n")
        
        pdf.set_font("Helvetica", "B", 9.5)
        pdf.write(4.1, f"{name} - Contribution: ")
        pdf.set_font("Helvetica", "", 9.5)
        pdf.write(4.1, f"{contrib}\n")
        
    pdf.ln(2.5)
    
    # Section 2: Project Overview
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "2. Project Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Purpose: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "The purpose of this project is to automate the cab booking and ride-hailing process. It replaces manual coordination with centralized records, automated fare estimation, driver status tracking, and request handling.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Features: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "User and driver JWT authentication; ride requests; driver status updates (accepting, starting, completing rides); admin dashboard for driver approval and ticket management; simulated payments; support ticketing system.\n")
    
    pdf.ln(2.5)
    
    # Section 3: Architecture
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "3. Architecture", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Frontend: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "React.js framework (Vite) utilizing custom CSS for modern, responsive layouts, Axios for API communications, and custom contexts for global state management.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Backend: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Node.js and Express.js REST API using JWT-based token verification, role-based protection middlewares, and ticket handling controllers.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Database: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "MongoDB database utilizing Mongoose ODM schemas for User, Driver, Ride, Payment, and Support models. Includes automated seeding and in-memory server simulation.\n")
    
    pdf.ln(2.5)
    
    # Section 4: Setup Instructions
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "4. Setup Instructions", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Prerequisites: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Node.js, internet connection, and a supported modern web browser such as Chrome or Edge.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Installation / Configuration: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Clone the project; run 'npm run install-all' to install dependencies for frontend and backend; configure '.env' variables in the backend; run 'npm run dev' to launch concurrent development servers; test with default seeded accounts.\n")
    
    pdf.ln(2.5)
    
    # Section 5: Application Components
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "5. Application Components", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "User Interface: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Responsive views for registration, login, user dashboard, driver dashboard, and admin dashboard.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Data Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Mongoose schemas for structured storage of users, drivers, rides, payments, and support ticket details.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Automation Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Express routing and state machine handlers processing ride request states from submission to completion.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Security Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "JWT verification filters, bcryptjs password hashing, and role-based route guard verification.\n")
    
    print("Page 1 End Y:", pdf.get_y())
    
    # ------------------ PAGE 2 ------------------
    pdf.add_page()
    
    # Section 6: Running the Application
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "6. Running the Application", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Onboarding / User Flow: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Log in as a user, enter pickup and drop locations, select vehicle type, request a ride, track status updates, and view payment completion.\n")
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Driver Flow: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Log in as a driver, toggle availability, view and accept incoming ride requests, update ride states (Arrived, In Progress, Completed).\n")
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Admin Flow: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Log in as admin, view registration requests, approve/reject new drivers, manage active support tickets, and review overall ride metrics.\n")
    
    pdf.ln(4)
    
    # Section 7: Workflow Operations
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "7. Workflow Operations", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Key Operations: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "User account creation; driver verification; ride state-machine updates; automatic fare estimation; simulated payments; support complaint resolution.\n")
    
    pdf.ln(4)
    
    # Section 8: Authentication and Access
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "8. Authentication and Access", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Security: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "JWT-based sessions verify client identity. Role protection ensures that driver registration reviews are admin-exclusive, ride-handling is driver-exclusive, and ride creation is user-exclusive.\n")
    
    pdf.ln(4)
    
    # Section 9: User Interface
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "9. User Interface", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Interface: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "The application utilizes React forms, tables, and modal components for booking, request lists, driver registrations, and customer support tracking, offering dynamic dashboards for all roles.\n")
    
    pdf.ln(4)
    
    # Section 10: Testing
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "10. Testing", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Tests Performed: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Verified registration validation; verified JWT authentication on restricted routes; simulated end-to-end ride flows (creation, assignment, updates); verified simulated payment updates; tested driver approval flows and ticket creation.\n")
    
    pdf.ln(4)
    
    # Section 11: Demo Link
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "11. Demo Link", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "https://drive.google.com/file/d/1EUKk-PCnRqCHPiMmYS2czJ8_a0bRNhfy/view?usp=sharing\n")
    
    pdf.ln(4)
    
    # Section 12: Known Issues
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "12. Known Issues", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Limitations: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "By default, the backend depends on MongoDB Memory Server; database records will be reset on application restart. The current location is hardcoded and simulated using coordinates rather than live GPS tracking.\n")
    
    pdf.ln(4)
    
    # Section 13: Future Enhancements
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "13. Future Enhancements", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Enhancements: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Integration with Google Maps API for path finding and live location updates; payment gateway integration (such as Stripe or Razorpay); real-time WebSocket connection for passenger-driver updates; mobile application with React Native.\n")
    
    # Output to file
    print("Page 2 End Y:", pdf.get_y())
    pdf.output(output_path)

if __name__ == "__main__":
    create_pdf("C:\\Users\\Pavanth\\.gemini\\antigravity\\scratch\\ucab\\Project_Documentation_UCAB.pdf")
    print("PDF generated successfully.")
