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
         "Implemented Express REST APIs for ride tracking and support; configured MongoDB Atlas integration."),
        ("Naveen Kumar Kondepudi", "Full-stack Developer and Tester", 
         "Verified API endpoints, conducted system integration tests, handled error middleware, and resolved issues."),
        ("Konatham Sreevanth", "Full-stack Developer and Documentation Specialist", 
         "Contributed to full-stack development, integrated GPS Geolocation APIs, implemented persistent database backups, and compiled documentation.")
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
    pdf.write(4.1, "To automate and optimize the cab booking and passenger-driver matching process. It provides central coordination, geolocation resolves, street OSRM route pathing, automated fare calculations, and interactive driver availability tracking.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Features: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Dual-map rendering layer (Google Maps & Leaflet maps fallbacks); dynamic geocoding (Nominatim API); draggable destination pins; simulated UPI/card/cash payment receipt gateways; forgot password database recovery resets; NH-16 3D traffic simulation.\n")
    
    pdf.ln(2.5)
    
    # Section 3: Architecture
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "3. Architecture", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Frontend: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "React (Vite SPA) featuring CSS custom variables styles, Axios request filters, Google Maps SDK hooks, Leaflet interactive mapping, and central Auth Context variables.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Backend: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Node.js with Express APIs using JWT session authentication, route guard parameters, and automatic persistent JSON DB backup serialization handlers.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Database: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "MongoDB Atlas cloud storage using Mongoose ODM schemas for User, Driver, Ride, Payment, and Support ticket models.\n")
    
    pdf.ln(2.5)
    
    # Section 4: Setup Instructions
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "4. Setup Instructions", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Prerequisites: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Node.js, active internet connection, and any modern web browser (e.g. Chrome, Firefox, Edge).\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Installation / Configuration: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Clone repo; execute 'npm run install-all' to configure frontend/backend modules; populate env variables (MONGO_URI, JWT_SECRET, VITE_API_URL); run 'npm run dev' to concurrently launch server and SPA portal.\n")
    
    pdf.ln(2.5)
    
    # Section 5: Application Components
    pdf.set_font("Helvetica", "B", 11.5)
    pdf.cell(0, 5.5, "5. Application Components", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(1.5)
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "User Interface: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Responsive dashboards for passengers, drivers, and administrator verified approvals. Includes floating HUD overlays and billing checkout nodes.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Data Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "Cloud MongoDB database instances synchronized with persistent local JSON backups to maintain account registration through server restarts.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Automation Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "State-machine dispatch updates matching passengers, starting navigation loops, and printing transaction bills.\n")
    
    pdf.set_font("Helvetica", "B", 9.5)
    pdf.write(4.1, "Security Layer: ")
    pdf.set_font("Helvetica", "", 9.5)
    pdf.write(4.1, "JWT authentication filters, bcryptjs passwords hashing, and role-based Express endpoint verification.\n")
    
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
    pdf.write(4.5, "Log in as passenger, permit GPS geolocating, search destinations dynamically, request cab matching, track curves routing, pay via simulated UPI QR code, print receipts.\n")
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Driver Flow: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Log in as driver, toggle online shifts, view incoming ride cards, accept, navigate street segments, mark arrivals, complete rides.\n")
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Admin Flow: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Log in as admin, approve driver onboarding requests, manage customer support tickets, review global booking parameters.\n")
    
    pdf.ln(4)
    
    # Section 7: Workflow Operations
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "7. Workflow Operations", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Key Operations: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Bilingual locale swaps (English & Telugu), geolocation reverse-geocodes, OSRM road curve routing pathing, draggable destination markers, auto-checkout countdowns.\n")
    
    pdf.ln(4)
    
    # Section 8: Authentication and Access
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "8. Authentication and Access", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Security: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "JWT authorizations verify user sessions. Role guards protect passenger-exclusive booking desks, driver-exclusive trip controls, and admin-exclusive verification dashboards.\n")
    
    pdf.ln(4)
    
    # Section 9: User Interface
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "9. User Interface", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Interface: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Modern glassmorphic floating HUD cards on mapping containers, animated pulsing matchmaking radar, Neon flowing route paths, and smooth vehicle markers glide transitions.\n")
    
    pdf.ln(4)
    
    # Section 10: Testing
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "10. Testing", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Tests Performed: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Verified dynamic geocoding queries under Nominatim; tested route rendering polyline outputs; simulated end-to-end driver matching queue timers; tested mobile responsive stacking configurations.\n")
    
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
    pdf.write(4.5, "None. The application utilizes a live MongoDB Atlas cloud database, persistent JSON backup synchronization, real-time GPS geolocation API resolution, and OSRM curves routing.\n")
    
    pdf.ln(4)
    
    # Section 13: Future Enhancements
    pdf.set_font("Helvetica", "B", 12)
    pdf.cell(0, 6, "13. Future Enhancements", new_x="LMARGIN", new_y="NEXT")
    pdf.ln(2)
    
    pdf.set_font("Helvetica", "B", 10)
    pdf.write(4.5, "Enhancements: ")
    pdf.set_font("Helvetica", "", 10)
    pdf.write(4.5, "Real-time WebSocket coordinates updates stream between driver and passenger portals; live commercial Stripe payment gateways; native mobile wrapping via React Native.\n")
    
    # Output to file
    print("Page 2 End Y:", pdf.get_y())
    pdf.output(output_path)

if __name__ == "__main__":
    create_pdf("C:\\Users\\Pavanth\\.gemini\\antigravity\\scratch\\ucab\\Project_Documentation_UCAB.pdf")
    print("PDF generated successfully.")
