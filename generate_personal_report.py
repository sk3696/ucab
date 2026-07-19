import sys
from fpdf import FPDF

class PersonalReportPDF(FPDF):
    def __init__(self):
        super().__init__(orientation="portrait", unit="mm", format="A4")
        self.set_margins(20, 28, 20)
        self.set_auto_page_break(auto=False)

    def header(self):
        # Header template with lines
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 4, "Individual Project Contribution Report - UCAB Platform", new_x="RIGHT", new_y="LAST")
        self.cell(0, 4, "Author: K. Sreevanth", align="R", new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(180, 180, 180)
        self.set_line_width(0.2)
        # horizontal line below header
        self.line(20, 24, 190, 24)
        self.ln(6)

    def footer(self):
        # Footer with line and page number
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(100, 100, 100)
        self.set_draw_color(180, 180, 180)
        self.set_line_width(0.2)
        # horizontal line above footer
        self.line(20, 282, 190, 282)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

def create_personal_report(output_path):
    pdf = PersonalReportPDF()
    
    # ------------------ PAGE 1 ------------------
    pdf.add_page()
    
    # Document Title Block
    pdf.set_font("Helvetica", "B", 16)
    pdf.set_text_color(30, 41, 59) # Deep Slate Blue
    pdf.cell(0, 9, "Individual Project Report - UCAB Platform", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(71, 85, 105)
    pdf.cell(0, 6, "Full-Stack Developer & Documentation Specialist Contribution", new_x="LMARGIN", new_y="NEXT", align="C")
    pdf.ln(6)
    
    # Section 1: Project Metadata
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "1. Project Metadata", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    # Metadata Fields
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.set_text_color(30, 41, 59)
    pdf.write(4.2, "Project Title: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "UCAB - Full-Stack Cab Booking & Ride-Hailing Platform\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Author: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Konatham Sreevanth\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "My Role: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Full-stack Developer and Documentation Specialist\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Team Collaborators: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Niharika Devi Guttula, Madiki Devi, Mahipala Veera Venkata Manikanta, and Naveen Kumar Kondepudi\n")
    
    pdf.ln(3)
    
    # Section 2: Executive Summary & Project Scope
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "2. Executive Summary & Project Scope", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "", 9.5)
    pdf.set_text_color(30, 41, 59)
    pdf.write(4.2, "The UCAB application is a web-based, full-stack cab booking and taxi dispatch software designed to streamline passenger-driver connectivity. The platform manages JWT authentication, user and driver dashboards, simulated payment processing, and customer support channels. As a Full-stack Developer and Documentation Specialist on the team, my primary objective was to coordinate full-stack feature development, implement test-verification pipelines, ensure API compatibility, and compile the technical layout of the system.\n")
    
    pdf.ln(3)
    
    # Section 3: My Key Contributions & Work Accomplished
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "3. My Key Contributions & Work Accomplished", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    contributions = [
        ("Geolocation & Geocoding Integrations", 
         "Integrated live HTML5 Geolocation API parameters to resolve passenger locations; hooked up Nominatim search engine to query dynamic location addresses in English/Telugu."),
        ("Dynamic Street Curves Routing", 
         "Configured OSRM street paths parsing logic into LeafletMap to draw routes tracing curves instead of straight lines, and set smooth linear transitions on vehicle markers."),
        ("Google Maps Wrapper Implementation", 
         "Architected a unified mapping container supporting dynamic switches between open-source Leaflet and official Google Maps wrappers via environment variables."),
        ("Persistent JSON Backups Synchronizer", 
         "Programmed local JSON backups file data sync handlers on backend authentication controllers, preventing registration resets upon DB restarts."),
        ("Error Diagnosis & Code Debugging", 
         "Resolved script-reloading loops in useJsApiLoader hook, debounced autocomplete suggestions, fixed payment schema enums validation checks, and corrected CSS stacking navbar panels.")
    ]
    
    for title, desc in contributions:
        pdf.set_font("Helvetica", "B", 9.5)
        pdf.write(4.2, f"- {title}: ")
        pdf.set_font("Helvetica", "", 9.5)
        pdf.write(4.2, f"{desc}\n")
        
    print("Page 1 End Y:", pdf.get_y())
    
    # ------------------ PAGE 2 ------------------
    pdf.add_page()
    
    # Section 4: System Architecture Overview
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "4. System Architecture Overview", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.set_text_color(30, 41, 59)
    pdf.write(4.2, "Frontend Stack: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Built with React.js (Vite framework) with responsive styled dashboards, centralized contexts for global auth state, Google Maps SDK wrapper, and Axios.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Backend Stack: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Node.js and Express.js REST APIs utilizing custom middleware for JWT generation, route guarding, persistent JSON database logs sync handlers, and unified error handling.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Database Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "MongoDB Atlas cloud storage using Mongoose ODM schemas for User, Driver, Ride, Payment, and Support models.\n")
    
    pdf.ln(3)
    
    # Section 5: Local Environment Setup & Run Procedures
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "5. Local Environment Setup & Run Procedures", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Setup Phase: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Install Node.js (v18+) and execute 'npm run install-all' from the project root to configure dependencies in both directories. Add environment variables for cloud DB and maps keys.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Execution Phase: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Run 'npm run dev' to concurrently launch the Express REST API and Vite server. Access the dashboards on local ports and test authentication flows.\n")
    
    pdf.ln(3)
    
    # Section 6: Specific Verification Scenarios Completed
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "6. Specific Verification Scenarios Completed", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "User Authentication: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Validated password hashing on registration, JWT token generation upon login, and route protections for drivers and administrators.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Ride Booking Workflow: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Created mock ride bookings from passenger dashboards, checked database insertions, verified availability changes, and updated trip statuses to completion.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.2, "Simulated Payment & Support: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "Tested fare collection triggers and simulated payment state updates; validated support ticketing logs for customer queries.\n")
    
    pdf.ln(3)
    
    # Section 7: Future Goals & Roadmap
    pdf.set_font("Helvetica", "B", 12)
    pdf.set_text_color(15, 23, 42)
    pdf.cell(0, 6, "7. Future Goals & Roadmap", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.2, "For future releases, my focus will be on integrating real-time coordinate streaming using WebSockets (Socket.io), adding production Stripe payment gateway integrations, and wrapping the responsive React dashboard within a cross-platform React Native app.\n")
    
    print("Page 2 End Y:", pdf.get_y())
    
    # Save the output
    pdf.output(output_path)

if __name__ == "__main__":
    create_personal_report("C:\\Users\\Pavanth\\.gemini\\antigravity\\scratch\\ucab\\Personal_Contribution_Report_Sreevanth.pdf")
    print("Personal report PDF generated successfully.")
