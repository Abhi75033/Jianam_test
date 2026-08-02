# PRD  

**1. PROJECT OVERVIEW**

 

**1.1**   **DETAILS**

Project Name: Jinanam

Tagline: Connecting Jain Life

 

**1.2**   **CORE OBJECTIVES**

The platform is designed with the following primary objectives:

 

**1. Monk Safety:**

   - Provide tracking (GPS + manual)

   - Generate alerts for risk scenarios (offline, delays, SOS)

**2. Journey Management:**

   - Plan routes between temples

   - Maintain journey timelines and logs

   - Notify upcoming temples and members

**3. Temple Coordination:**

   - Enable seamless communication between temples

   - Manage incoming and outgoing monks

   - Provide shared monk data system

**4. Devotee Engagement:**

   - Allow members to track monks

   - Participate in events, tours, and seva

   - Receive announcements and updates

**5. Donation Transparency:**

   - Manual and digital donation tracking

   - Verification workflow

   - Receipt generation with compliance details

**6. Accommodation Management:**

   - Room and hall booking in Dharmshala

   - Availability tracking

   - Payment and verification workflow

 

 

**7. Community Platform:**

- Feed, polls, announcements

- Volunteer participation

- Offers and engagement

 

**1.3 PLATFORM COMPONENTS**

The system will consist of two primary platforms:

**A. Admin Portal (Mobile App + Web)**

Used by:

- Super Admin

- Temple Admin

- Dharmshalas Admin

- JC (Jain Center) Admin

(Provide option where Super Admin Will define the allocation of features)

 

Purpose:

- Full system control

- Data management

- Monitoring and operations

 

**B. Member Platform (Mobile App + Web)**

   Used by:

   - Devotees / Members

 

   Purpose:

   - Track monks

   - Engage with temples

   - Participate in events and bookings

   - Make donations

 

**1.4 SYSTEM APPROACH**

The system will support two tracking approaches:

**1. Manual Journey Tracking:**

   - Temple admins manually create journey

   S**ystems should:**

- Work independently

- Be visible at the same interface

- Maintain consistent journey logs

 

**1.5 TARGET USERS**

**1. Monks Admin**

   - Being tracked for safety and coordination

**2. Temple Admins**

   - Manage operations of temple and monks

**3. Dharmshalas Admins**

   - Manage accommodation and facilities

**4. Devotees / Members**

   - Track monks

   - Participate in events and services

   - Donate and engage with temples

**5. Jain Centers Admin**

**6. Super Admin**

   - Central authority managing the entire system

 

**1.6 DESIGN PRINCIPLES**

The platform should follow:

- Simple and intuitive UI (non-technical users)

- Mobile-first design with best UI/UX

- Minimal input complexity

- Clear navigation

- Fast performance

- High reliability

- Graphical

 

**1.7 SYSTEM PRIORITIES**

The system should prioritize:

1. Safety & Security (highest priority)

2. Reliability

3. Ease of use

4. Transparency

5. Scalability

 

**1.8 SUCCESS METRICS**

The system’s success will be measured by:

- Number of monks tracked

- Number of temples onboard

- Active members

- Donations processed

- Events Participation

- Reduction in safety incidents

 

**2. PLATFORM STRUCTURE**

 

**2.1 OVERALL ARCHITECTURE**

The Jinanam system is designed as a multi-platform ecosystem consisting of:

1. Super Admin Portal

2. Admin Portal (Mobile App + Web)

3. Member Platform (Mobile App + Web)

4. Backend System (APIs, database, logic engine)

5. External Integrations (GPS Location, Google map API, WhatsApp API, Payment Gateway)

 

All platforms should be connected to a centralized backend system to ensure:

- Real-time synchronization

- Data consistency

- Scalable architecture

 

**2.2 ADMIN PORTAL (Mobile App + Web)**

**Platform Type:**

- Mobile App + Web

**Users:**

- Super Admin

- Temple Admin

- Dharmshalas Admin

- JC Admin

 

**2.2.1 PURPOSE**

**The Admin Portal will act as the control center of the entire system and will be used for:**

- Managing monks and journeys

- Managing temples and dharmshalas

- Monitoring live tracking and alerts

- Managing bookings (Rooms/Halls/Temples/Pooja etc.)

- Creating and managing events and tours

- Verifying donations and generating receipts

- Communication between temples

- Viewing reports and analytics

- Managing users, roles, and permissions

 

**2.2.2 KEY CHARACTERISTICS**

- Dashboard-driven interface

- Data-heavy screens (tables, filters, reports, graphical etc.)

- Multi-user role support

- Secure access control

- Fast navigation and minimal clicks for actions

 

**2.2.3 ACCESS CONTROL**

- Login via Mobile Number (OTP + Password option)

**Role-based access:**

- Super Admin → Full access

- Temple Admin → Limited to assigned temple (super Admin will decide)

- Dharmshalas Admin → Limited to accommodation and related modules (Super Admin will decide)

 

**2.2.4 MODULE ACCESS (HIGH LEVEL)**

**Admin Portal will include:**

- Dashboard

- Temple Management

- Temple Network

- Monk Management

- Live Tracking

- Route Planning

- Journey Logs

- Booking Management

- Event & Tour Management

- Volunteer Management

- Member Management

- Alerts & Monitoring

- Donation Management

- Communication System

- Reports & Analytics

- Settings

- Audit Logs

Each module must be accessible via sidebar navigation with menu and sub menu.

 

**2.3 MEMBER PLATFORM (MOBILE APP + WEB)**

**Platform Type:**

- Primary: Mobile App (Android & iOS)

- Secondary: Web version

**Users:**

- Devotees / Members

 

**2.3.1 PURPOSE**

The Member Platform will provide a simple and user-friendly interface for:

- Tracking monks

- Viewing temple information

- Participating in events and tours

- Booking rooms/halls/Temples

- Making donations

- Viewing announcements and feed

- Engaging with the community

 

**2.3.2 KEY CHARACTERISTICS**

- Mobile-first design

- Best UI/UX (minimal complexity)

- Fast loading

- Clear navigation

- Visual and intuitive interaction

 

**2.3.3 AUTHENTICATION**

- Login via Mobile Number

- OTP-based authentication (primary)

- Password login option

 

**2.3.4 CORE MODULES**

Member Platform will include:

- Dashboard

- Monk Tracking

- Temple Directory

- Bookings

- Events (Free + Paid)

- Tours 

- Volunteers

- Feed + Polls + Offers

- Gallery

- Announcements

- Donations

- Profile & Settings

 

**2.3.5 USER EXPERIENCE GUIDELINES**

- Minimal typing required

- More selection-based input

- Clear buttons and actions

- Status visibility (booking, donation, etc.)

- Notifications for every important action

 

**2.4 BACKEND SYSTEM**

The backend system will act as the core engine connecting all platforms.

 

**2.4.1 RESPONSIBILITIES**

- Store and manage all data

- Handle APIs for mobile and web

- Process tracking data (GPS/manual)

- Manage alerts and notifications

- Handle booking and donation workflows

- Maintain audit logs

- Ensure security and access control

 

**2.4.2 DATA MANAGEMENT**

- Centralized database

- Real-time updates where required

- Data validation and consistency checks

 

**2.4.3 PERFORMANCE REQUIREMENTS**

- Fast API response time

- Ability to handle concurrent users

- Scalable architecture

 

**2.5 EXTERNAL INTEGRATIONS**

**2.5.1 GPS DEVICE INTEGRATION**

- Receive location data at defined intervals

- Store and display tracking data

 

**2.5.2 WHATSAPP API**

**Send notifications:**

- Announcements & Notice

- Bookings

- Donation receipts

 

**2.5.3 PAYMENT GATEWAY**

**Used for:**

- Paid events (creation right to Super Admin only)

- Jinanam donations

- Jain Music Festival

 

**Requirements:**

- Secure transactions

- Payment confirmation

- Integration with receipt system

 

**2.5.4 SMS**

- Backup notification system

- Used if WhatsApp fails

 

**2.6 DATA FLOW OVERVIEW**

**Example flow:**

1. Member books room → Backend stores booking → Admin Approves that booking à payment details → Member uploads proof → Admin verifies → Booking confirmed

2. Temple creates event → Backend stores → Members receive notification → Members RSVP → Data visible in admin panel

 

**2.7 SYSTEM SYNCHRONIZATION**

- All platforms must be synchronized in near real-time

- Updates from admin side should reflect instantly in member app

- Tracking updates should be reflected based on configured frequency

 

**2.8 SCALABILITY CONSIDERATION**

The system must be designed to:

- Support multiple countries, cities and regions

- Handle increasing number of temples and users

- Scale without performance degradation

 

**2.9 RELIABILITY & FAILSAFE**

- Manual journey tracking

**System should handle:**

- Device failure

- Network issues

- Data delays

 

**2.10 SECURITY**

- Role-based access control

- Secure authentication

- Data protection for users

- Restricted access to sensitive data

 

**3. USER ROLES & PERMISSIONS**

**3.1 OVERVIEW**

The Jinanam system will operate on a role-based access control (RBAC) model.

Each user will be assigned a specific role, and access to features, data, and actions will be restricted based on that role.

The system will have three primary user roles:

1. Super Admin

2. Temple/Dharmshalas/JC Admin and so on.

3. Member (Devotee)

 

**3.2 ROLE DEFINITIONS**

**3.2.1 SUPER ADMIN**

**Role Type:**

- Highest authority in the system

- Full access to all modules, data, and controls

**Responsibilities:**

- Create and manage temples and dharmshalas

- Assign admin users to temples

- Manage all monk profiles

- Monitor all journeys and tracking

- Verify and manage all donations

- Create and manage paid events

- Manage advertisements and offers

- View system-wide reports and analytics

- Manage roles and permissions

- Access and manage audit logs

- Delete users, monks, temples (only role with delete rights)

- Post announcements and push notifications

**Permissions:**

- Full Create / Read / Update / Delete (CRUD) access across all modules

- Access to all data across all temples

- Override control in case of conflicts

**Restrictions:**

None

**3.2.2 TEMPLE / DHARMSHALAS ADMIN**

**Role Type:**

- Operational user managing a specific temple or dharmshalas

**Responsibilities:**

- Manage temple/dharmshalas profile

- Create and manage events and tours

- Manage accommodation (rooms, temples and halls)

- Handle booking approvals and tracking

- Verify donations and generate receipts

- Update monk journeys (manual tracking)

- View live tracking of monks

- Communicate with other temples

- Manage volunteers

- Upload gallery content

- Post announcements and push notifications

**Permissions:**

- Create and update data related to their own temple/dharmshalas

- View monks, journeys, and relevant data

- Edit monk profiles (shared system)

- Approve/reject bookings

- Verify donations for their temple

**Restrictions:**

- Cannot access or modify data of other temples (except shared monk data)

**Cannot delete:**

- Monk profiles

- Temple/dharmshalas profiles

- Members

- Cannot create paid events

- Cannot manage advertisements

**Data Visibility:**

- Full access to their own temple data

- Limited/shared access to monk profiles

- No access to other temple financial data

 

**3.2.3 MEMBER (DEVOTEE)**

**Role Type:**

- End user of the platform (mobile + web)

**Responsibilities:**

- Track monks

- View temples and dharmshalas

- Participate in events and tours

- Book rooms and halls

- Make donations

- Engage in feed and polls

- Receive announcements and notifications

**Permissions:**

- View monks available in system

- View temple profiles and information

- RSVP to events and tours

- Book rooms/halls/pooja etc.

- Upload payment proof

- View donation receipts

- Participate in polls and community feed

**Restrictions:**

- Cannot access admin portal

- Cannot create or modify temple data

- Cannot verify donations

- Cannot approve bookings

- Cannot delete their own profile and cannot edit or delete member ID

- Cannot access/view other members’ sensitive data except name and city/state

 

**3.3 PERMISSIONS MATRIX (SUMMARY)**

Action-wise access:

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| **Module** | **Super Admin** | **Temple Admin** | **Member** |
| Create Admin | Yes | No | No |
| Edit Admin | Yes | Yes (own) | No |
| Delete Admin | Yes | No | No |
| Create Monk | Yes | Yes | No |
| Edit Monk | Yes | Yes | No |
| Delete Monk | Yes | No | No |
| Track Monks | Yes | Yes | Yes |
| Create Events | Yes | Yes | No |
| Create Paid Events | Yes | No | No |
| RSVP Events | Yes | No | Yes |
| Booking Approval | Yes | Yes | No |
| Make Booking | Yes | Yes | Yes |
| Verify Donations | Yes | Yes | No |
| Make Donation | Yes | Yes | Yes |
| Access Reports | Yes | Limited | No |
| Manage Ads | Yes | No | No |
| Manage Offers | Yes | No | No |
| Digital Counting | Yes | No | Yes |
| View Audit Logs | Yes | Limited | No |

 

**3.4 ACCOUNT CREATION RULES**

**Temple/Dharmshalas:**

- Created only by Super Admin

- Login credentials shared by Super Admin

- Cannot self-register

**Members:**

- Can self-register via mobile number (OTP)

- Profile auto-created after verification

 

**3.5 PROFILE DELETION RULES**

- Members cannot delete their own profile

- Temple admins cannot delete temple/dharmshalas profiles

- Monk profiles cannot be deleted by temple admins

**Only Super Admin can:**

- Delete members

- Delete monks

- Delete temples/dharmshalas

 

**3.6 DATA ACCESS CONTROL**

- Role-based access must be strictly enforced

- APIs must validate user role before returning data

- Sensitive data (payments, contacts) must be restricted

 

**3.7 AUDIT & ACCOUNTABILITY**

All roles must be tracked via audit logs:

- Every action should be recorded:

- User ID

- Role

- Action performed

- Timestamp

- Critical actions include:

- Donation verification

- Booking approval

- Profile updates

- Route changes

 

**3.8 SECURITY RULES**

- No unauthorized access to modules

- Session management required

- OTP-based verification for login

- Data encryption for sensitive information

 

 

 

 

 

**4. MEMBER PLATFORM (MOBILE APP + WEB)**

**4.1 OVERVIEW**

The Member Platform is designed for devotees to interact with the Jinanam ecosystem.

**It will be:**

- Mobile-first (Android & iOS)

- Simple and intuitive

- Minimal input-based

- Highly visual and easy to navigate

**The platform should allow members to:**

- Join and Track monks

- Engage with temples

- Participate in events and tours

- Book accommodation

- Make donations

- Receive notifications and updates

 

**4.2 AUTHENTICATION & ONBOARDING**

**4.2.1 PURPOSE****  
** This module manages user login, registration, and profile creation using a mobile-first approach.  
  
 **4.2.2 LOGIN OPTIONS****  
** - Mobile Number + OTP (Primary)  
 - Mobile Number + Password (Secondary)  
  
 **4.2.3 LOGIN FLOW (OTP)****  
** 1. User enters mobile number  
 2. System sends OTP  
 3. User enters OTP  
 4. System verifies OTP  
 5. If valid:  
 - Login successful  
  
 **4.2.4 LOGIN FLOW (PASSWORD)****  
** 1. User enters mobile number + password  
 2. System validates credentials  
 3. Login successful  
  
 **4.2.5 FIRST-TIME USER FLOW****  
** - After OTP verification:  
 - Redirect to profile creation  
  
 **4.2.6 PROFILE CREATION FIELDS (Below is sample, Complete details in another word file)****  
** - Full Name (mandatory)  
 - Mobile Number (auto-filled)

- WhatsApp Number

- Country (mandatory)  
 - City (mandatory)  
 - State (mandatory)

- Area – Malad E, Malad W etc.  
 - Community  
  
  

- Each member must be assigned a unique Member ID at the time of account creation.  
  **This Member ID should be:****  
** - System-generated  
 - Unique across the platform  
 - Non-editable by the user  
  
 **Member ID should be used for:****  
** - Internal member tracking/profile view by admin and super admin  
 - Booking records  
 - Donation records  
 - Audit logs  
  
 Member should be able to view their Member ID in profile section.  
  
 **4.2.7 FAMILY MEMBER ADDITION**

User can add multiple family members:  
 - Name  
 - Mobile Number  
  
 **Flow:****  
** - Upon submission:  
 - SMS/WhatsApp sent:  
 "Your profile has been created by [Name]. Download the app to continue."  
  
 **4.2.8 PROFILE RULES****  
** - Members can edit profile  
 - Members cannot delete profile  
 - Only Super Admin can delete  
  
  

**4.2.9 VALIDATION RULES****  
** - Mobile number must be unique  
 - OTP expiry: 2–5 minutes  
 - Limit OTP retries  
  
 **4.2.10 SESSION MANAGEMENT****  
** - User remains logged in unless:  
 - Logout manually  
  
 **4.2.11 SECURITY****  
** - OTP must be encrypted  
 - Rate limit OTP requests  
 - API must validate mobile number format  
  
 **4.2.12 EDGE CASES****  
** - Invalid OTP → show error  
 - OTP expired → allow resend  
 - Duplicate number → login instead of register

 

**4.3 DASHBOARD (HOME SCREEN)**

**4.3.1 PURPOSE****  
** Provide a centralized overview of important updates, alerts, and quick access to key features.  
  
 **4.3.2 COMPONENT STRUCTURE****  
** Dashboard should be divided into the following sections:

**1. Monk Tracking Section****  
** - Monk Name  
 - Status (Moving / Idle / Offline)  
 - Current Location  
 - Last Updated Time  
 **Action:****  
** - Click → open tracking details  
  
 **3. Upcoming Events****  
** - Event Name  
 - Date & Time  
 - Temple  
 **Action:****  
** - RSVP button

**4. Announcements****  
** - Latest updates from temples  
  
 **5. Feed Preview****  
** - Latest posts

 

**6 Show "Today's Tithi"****  
****  
** **4.3.3 PRIORITY LOGIC****  
** **Display order:****  
** 1. Alerts  
 2. Monk Tracking  
 3. Events  
 4. Announcements  
 5. Feed

  
 **4.3.4 PERSONALIZATION****  
** Data shown based on:  
 - Linked temples  
 - Active monks  
  
 **4.3.5 INTERACTION****  
** - Each section is clickable  
 - Redirect to respective module  
  
  

**4.3.6 ACTION BEHAVIOR****  
** - Monk card → Tracking screen  
 - Event card → Event details  
 - Announcement → Full view  
 - Feed → Feed page

- Offers → Offers page  
  
 **4.3.7 EDGE CASES****  
** - No data → show placeholders:  
 - "No events available"  
 - "No monks available"

 

**4.4 MONK TRACKING MODULE**

**4.4.1 PURPOSE****  
** Enable members to track monks in real-time via manual journey updates.  
  
 **4.4.2 VIEW TYPES****  
** 1. Map View  
 2. List View  
  
 **4.4.3 MAP VIEW FEATURES****  
** - Display monk markers  
 - Status colors:  
 - Green → Moving  
 - Yellow → Idle  
 - Red → Offline  
  
 **4.4.4 MONK DETAILS (ON CLICK)****  
** - Monk Name  
 - Current Location  
 - Status  
 - Last Updated Time

- Route (if available)  
  
 **4.4.5 LIST VIEW****  
** - Monk Name  
 - Status  
 - Location  
  
 **4.4.6 JOIN MONK FEATURE****  
** - If monk is within defined radius:  
 - Notify user  
 - User can choose to join  
 **Rules:****  
** - Visibility of joined users is optional  
 - Contact details shared only with consent  
  
 **4.4.7 FILTERS****  
** - By Temple  
 - By Status (Moving / Idle / Offline)  
 - By Community  
  
 **4.4.8 DATA SOURCE****  
** - Manual journey updates  
  
 **4.4.9 REFRESH LOGIC****  
** - Auto refresh based on tracking interval  
 - Manual refresh option for user  
  
 **4.4.10 RULES****  
** - Show last known location if offline  
 - Always display latest available data  
  
 **4.4.11 PRIVACY RULES****  
** - Member identity visibility should be optional  
 - Personal contact details must not be exposed without consent  
  
 **4.4.12 EDGE CASES****  
** - Device offline → show last known location  
 - Incorrect data → allow admin correction (logged)

 

**4.5 TEMPLE DIRECTORY & PROFILE**

**4.5.1 PURPOSE****  
** This module allows members to explore temples and dharmshalas, view complete information, and stay connected with their activities.  
  
 **4.5.2 TEMPLE LISTING****  
** - Display list of temples  
 - Search and filter by:  
 - City  
 - State  
  
 **4.5.3 TEMPLE PROFILE DETAILS (complete details in another word file)****  
** Each temple profile should include:  
 - Temple Name  
 - Location (Map view)  
 - Address  
 - Contact Details  
 - Pooja Timings  
 - Dhaja Information:  
 - Last Dhaja By (link member)  
 - Next Dhaja By (link member)  
 - Dhaja Date  
 - Temple Biography / History  
 - Bank / UPI Details (for donation)  
 - Gallery (images/videos links)  
 - Upcoming Events  
 - Tours  
  
 **4.5.4 MEMBER INTERACTIONS****  
** Members can:  
 - View full temple details  
 - Donate to temple  
 - View events and tours  
 - Access gallery  
 - Link temple to their profile  
  
 **4.5.5 RULES****  
** - Temple profiles are created only by Super Admin  
 - Temple admins can edit details  
 - Temple profile cannot be deleted by temple admin  
 - Only Super Admin can delete permanently  
  
 **4.5.6 EDGE CASES****  
** - Inactive temple → marked inactive  
 - Missing details → show placeholders

 

**4.6 DHARMSHALAS & BOOKING**

**4.6.1 PURPOSE****  
** This module allows members to book rooms and halls in dharmshalas with a structured approval and payment verification system.  
  
 **4.6.2 BOOKING TYPES (Let admin decide what to create)****  
** - Room Booking  
 - Hall Booking

- Temple Booking

- Pooja Booking  
  
 **4.6.3 BOOKING FLOW (MEMBER)****  
** 1. Select Temple/Dharamshala  
 2. View available rooms/halls  
 3. Select option  
 4. View:  
 - Price  
 - Capacity  
 - Rules  
 5. Submit booking request  
 6. System displays payment details  
 7. Member uploads payment proof  
 8. Booking status set to "Payment Pending"  
 9. Admin verifies payment  
 10. Booking confirmed  
  
 **4.6.4 BOOKING STATUS****  
** - Pending  
 - Payment Pending  
 - Confirmed  
 - Cancelled  
  
 **4.6.5 RULES****  
** - Payment must be completed within 1 hour  
 **If not:****  
** - Booking auto-cancelled  
 - Slot becomes available again  
 - Prevent double booking  
 - Booking ID must be generated for each booking  
  
 **4.6.6 MEMBER FEATURES****  
** - View booking history  
 - Track booking status  
 - Receive notifications:  
 - Booking submitted  
 - Booking confirmed  
 - Booking cancelled  
  
 **4.6.7 VALIDATION****  
** - Check availability before booking  
 - Prevent duplicate booking requests  
  
 **4.6.8 EDGE CASES****  
** - Payment uploaded but not verified → show "Pending"  
 - Booking expired → auto cancel  
 - Invalid payment proof → reject

 

**4.7 EVENTS MODULE**

**4.7.1 PURPOSE****  
** This module allows Admins to create events and members to view, filter, and participate in them.  
  
 **4.7.2 EVENT TYPES****  
** **1. Temple-Specific Events****  
** - Visible only to linked members  
  
 **2. Public Events****  
** - Visible to all members  
  
 **4.7.3 EVENT CREATION (ADMIN)****  
** **Fields:****  
** - Event Title  
 - Description  
 - Date & Time  
 - Temple  
 - Location  
 - Event Type (Temple/Public)  
 - Capacity (optional)  
 - Instructions (optional)  
  
 **4.7.4 MEMBER FLOW****  
** 1. Member opens Events section  
 2. Applies filters:  
 - City  
 - Date  
 - Temple  
 3. Views event list  
 4. Selects event  
 5. Views details  
 6. Clicks RSVP  
  
 **4.7.5 RSVP SYSTEM****  
** Member registers for event  
 Status:  
 - Registered  
 - Cancelled

- Approved  
  
 **4.7.6 CAPACITY CONTROL****  
** - Admin defines maximum capacity  
 Once full:  
 - Disable RSVP  
 - Show Waitlist  
  
 **4.7.7 MEMBER FEATURES****  
** - View upcoming events  
 - RSVP  
 - Share events on social media with APP link, so if anyone wants to view the event, they have to download the app.  
  
  

**4.7.8 NOTIFICATIONS****  
** - Event created → notify members  
 - 12hrs Reminder before event (applies to all free events)

- 12hrs and 3hrs Reminder before event (applies to all paid events)  
  
 **4.7.9 EDGE CASES****  
** - Event cancelled → notify all participants  
 - Capacity full → disable RSVP  
 - No events → show placeholder

 

**4.8 PAID EVENTS**

4.8.1 PURPOSE  
 This module allows the Jinanam platform (Super Admin only) to create and manage paid events, where members can book tickets through the app and gain entry using a QR-based system.  
 This is a controlled feature and will not be available to temples.  
  
 **4.8.2 ACCESS CONTROL****  
** - Only Super Admin can:  
 - Create paid events  
 - Manage pricing  
 - View bookings  
 - Temple admins cannot create or manage paid events  
  
 **4.8.3 EVENT CREATION (SUPER ADMIN)****  
** Fields:  
 - Event Title  
 - Description  
 - Date & Time  
 - Location  
 - Event Banner/Image  
 - Ticket Price  
 - Total Capacity  
 - Instructions (optional)  
 - Terms & Conditions (optional)  
  
 **4.8.4 MEMBER FLOW****  
** 1. Member opens Events section  
 2. Views paid events (clearly marked)  
 3. Selects event  
 4. Views details:  
 - Price  
 - Date & Time  
 - Location  
 - Available slots  
 5. Clicks "Book Now"  
 6. Proceeds to payment (via payment gateway)  
 7. Payment successful  
 8. Ticket generated  
 9. QR code displayed  
  
 **4.8.5 PAYMENT SYSTEM****  
** - Integrated payment gateway required  
 - Real-time payment confirmation  
 - Payment failure → show error and allow retry  
  
 **4.8.6 TICKET GENERATION****  
** - Unique ticket generated per booking  
 - QR code generated for each ticket  
  
 **4.8.7 QR CODE RULES****  
** - Each QR code must be:  
 - Unique  
 - Non-reusable  
 - Used for event entry verification  
  
 **4.8.8 ENTRY SYSTEM****  
** - QR code scanned at event entry  
 - System validates ticket:  
 - Valid → Allow entry  
 - Invalid / Used → Deny entry  
  
 **4.8.9 MEMBER FEATURES****  
** - View booked events  
 - Access QR code anytime  
 - View ticket details  
  
 **4.8.10 ADMIN FEATURES****  
** - View list of bookings  
 - View participant details  
 - Track total revenue  
 - Download reports  
  
 **4.8.11 CAPACITY CONTROL****  
** - Once capacity is reached:  
 - Disable booking  
  
 **4.8.12 NOTIFICATIONS****  
** - Booking confirmation  
 - Payment confirmation  
 - Event reminder  
  
 **4.8.13 EDGE CASES****  
** - Payment success but ticket not generated:  
 → System must auto-reconcile and generate ticket  
  
 - Duplicate booking attempts:  
 → Allow only if multiple tickets permitted (optional)  
  
 - QR already used:  
 → Block entry  
  
 - Event cancelled:  
 → Notify users  
 → Refund logic (if applicable)

 

**4.9 TOURS**

**4.9.1 PURPOSE****  
** This module allows temples to organize spiritual tours and enables members to participate.  
  
 **4.9.2 TOUR CREATION (ADMIN)****  
** **Fields:****  
** - Tour Title  
 - Description  
 - Start Location  
 - Destination(s)  
 - Route (multi-stop)  
 - Start Date & Time  
 - End Date & Time  
 - Organizer (Temple/Dharamshala/JC Selection if creating on behalf of some others)  
 - Contact Details  
 - Capacity (max participants)  
 - Rules / Instructions  
  
 **4.9.3 MEMBER FLOW****  
** 1. View tours  
 2. Select tour  
 3. View details (route, date, slots)  
 4. Click RSVP  
 5. Status shown:  
 - Confirmed / Waiting / Cancelled  
  
 **4.9.4 RULES****  
** - Stop RSVP when capacity full  
 - Optional waitlist  
 - Member can cancel (optional)  
  
 **4.9.5 NOTIFICATIONS****  
** - Tour created  
 - Reminder before start  
 - Updates  
  
 **4.9.6 EDGE CASES****  
** - Tour cancelled → notify all  
 - Capacity full → disable RSVP

 

**4.10 VOLUNTEERS**

**4.10.1 PURPOSE****  
** This module allows temples to request volunteers and enables members to participate in seva activities.  
  
 **4.10.2 VOLUNTEER CREATION (ADMIN)****  
** **Fields:****  
** - Event Name  
 - Role Title  
 - Description of work  
 - Number of volunteers required  
 - Date & Time  
 - Location (Temple/Dharamshala)  
 - Instructions  
 - Contact Person  
  
 **4.10.3 MEMBER FLOW****  
** 1. Member opens Volunteers section  
 2. Views available opportunities  
 3. Selects a role  
 4. Views details  
 5. Clicks "Apply"  
  
 **Status:****  
** - Applied  
 - Approved  
 - Rejected  
  
 **4.10.4 ADMIN FLOW****  
** - View applicants  
 - Approve / Reject  
 - Assign roles (optional)  
  
 **4.10.5 RULES****  
** - Stop applications when required count is reached  
 - Prevent duplicate applications  
 - Admin can override capacity (optional)  
  
  
 **4.10.6 NOTIFICATIONS****  
** - New opportunity → notify members  
 - Approval → notify member  
 - Reminder → notify volunteers  
  
 **4.10.7 EDGE CASES****  
** - Volunteer cancels → reopen slot  
 - Event cancelled → notify all volunteers

 

**4.11 FEED + POLLS + OFFERS**

**4.11.1 PURPOSE****  
** This module acts as a community engagement platform where members can view updates, participate in polls, and see sponsored content.  
  
 **4.11.2 FEED CONTENT TYPES****  
** Feed will include:  
  
 **1. Temple Updates****  
** - Events  
 - Announcements  
 - Activities  
  
 **2. Monk Updates****  
** - Journey updates  
 - Arrival notifications  
  
 **3. System Updates****  
** - Alerts  
 - Important notifications  
  
 **4. Sponsored Content (Ads)****  
****  
** **4.11.3 FEED STRUCTURE****  
** Each feed card should include:  
 - Title  
 - Description  
 - Image/Video (optional)  
 - Posted by (Temple/System)  
 - Timestamp  
 - Action button (optional):  
 - RSVP  
 - View Details  
 - Donate  
  
 **4.11.4 POLLS****  
** **Purpose:****  
** - Engage members in decision-making or feedback  
  
 **Features:****  
** - Single choice poll  
 - Multiple choice poll (optional)  
 - View results after voting  
  
 **Fields:****  
** - Question  
 - Options (2 or more)  
 - Expiry date (optional)  
  
 **Rules:****  
** - One vote per user  
 - Cannot change vote after submission  
  
  
  

**4.11.5 ADVERTISEMENT**

**4.11.5.1 PURPOSE**

This module enables sponsored advertising within the app to generate revenue while maintaining a clean and non-intrusive user experience.

 

**4.11.5.2 AD PLACEMENT (FEED)**

1. Top Feed Banner (Primary Ad Slot)

- Display 1 advertisement banner at the top/center of feed when user opens the app

- Format:

   - Image slider (carousel)

   - Total 3 images per ad slot

- Each image should support:

   - Separate hyperlink (click action)

   - Redirect to external/internal link

 

2. In-Feed Ads (After Every 3 Posts)

- After every 3 feed posts:

   - Show 1 advertisement card

- Each ad card:

   - Same format as above (3-image slider)

   - Each image has its own clickable link

 

3. Total Ad Slots

- Maximum 5 ad placements per feed session

- Each slot contains:

   - 3 image slider (carousel format)

 

**4.11.5.3 AD STRUCTURE**

Each advertisement must include:

- 1 to 3 images (slider)

- Title (optional)

- Description (optional)

- Clickable link per image

- Company/Brand name (optional)

- Contact details (optional)

 

**4.11.5.4 DISPLAY RULES**

- Ads should:

   - Blend naturally with feed UI

   - Not disrupt user experience

 

**4.11.5.5 OFFERS PAGE (DEDICATED AD MODULE)**

- Separate "Offers" page in app

Each offer should include:

- Image/banner

- Offer description

- Company name

- Contact number

- Website / external link

- Terms & conditions

 

**4.11.5.6 OFFER SCHEDULING**

Super Admin can define:

- Start Date:

   - Offer becomes visible from this date

- End Date:

   - Offer is removed automatically from active list

   - Moved to "Expired Offers" section (Admin + Member)

 

**4.11.5.7 OFFER DISPLAY**

- Display as card-based layout

- Each card contains:

   - Image

   - Description

   - CTA button (Visit / Contact / Redeem)

 

**4.11.5.8 ADMIN CONTROL**

- Only Super Admin can:

   - Create ads

   - Edit ads

   - Schedule ads

   - Remove ads

- Push Notifications send options with selections like city, state country etc. to be given to super admin for each ad. While creating the ad the super admin should have 2 options: 1-Select all, 2-Specific to city, state, country and if selected specific then only the members registered to that city, state, country should view the add in their app.

**- Temples cannot manage advertisements**

 

**4.11.5.9 TRACKING & ANALYTICS (IMPORTANT)**

System should track:

- Number of views (impressions)

- Number of clicks

- Click-through rate (CTR)

 

**4.11.5.10 RULES**

- Expired offers must not be shown in active list to Super admin and members

 

**4.11.5.11 EDGE CASES**

- Broken link → show fallback message or ignore click

- No active ads → hide ad slots

- Expired offer → auto move to expired section

- Ad posted → Send push notification to the members

- Ad Expiry → Send push notification to the members before 12hrs of the expiry  
  
 **4.11.6 FEED PERSONALIZATION****  
** - Members should see:  
 - Content from linked temples (primary + secondary)  
 - General system content  
  
 **4.11.7 INTERACTION (OPTIONAL FUTURE)****  
** - Like  
 - Share  
 - Comment (optional, Phase 2)  
  
 **4.11.8 NOTIFICATIONS****  
** - New post → notify members  
 - Important updates → push notification  
  
 **4.11.9 EDGE CASES****  
** - Expired poll → disable voting  
 - Deleted post → remove from feed  
 - Ad expiry → auto remove

 

**4.12 OFFERS PAGE** **– Refer 4.11.5 (****ADVERTISEMENT****)****  
****  
  
**

**4.13 GALLERY**

**4.13.1 PURPOSE****  
** This module allows temples and dharmshalas to upload and showcase images and videos of events, activities, and facilities.  
  
 **4.13.2 CONTENT TYPES****  
** Gallery should support:  
 - Images  
 - Video links (YouTube or external)  
  
 **4.13.3 STRUCTURE****  
** Gallery should be organized in:  
 1. Event-wise Gallery  
 - Each event has its own media collection and folder name with date and location  
 2. General Gallery  
 - Temple/dharamshala-level uploads  
  
 **4.13.4 MEDIA CARD STRUCTURE****  
** Each item should include:  
 - Thumbnail  
 - Title  
 - Event name, date and time  
 - Upload date  
 - Media type (image/video link)  
  
 **4.13.5 FEATURES****  
** - Grid view display  
 - Click to open full view  
 - Video preview (for YouTube links)  
 - Swipe/scroll navigation  
  
 **4.13.6 ADMIN FLOW****  
** - Upload images/videos link  
 - Add media to:  
 - Specific folder, event OR  
 - General gallery  
 - Add title, event date, location, time & description  
  
 **4.13.7 RULES****  
** - Support multiple uploads each event can have 50images and 25 video link options only  
 - Maintain media quality optimization  
  
 **4.13.8 EDGE CASES****  
** - Broken video link → show fallback message  
 - No delete options to admin, they can raise the ticket to super admin for event delete.

 

**4.14 ANNOUNCEMENTS**

**4.14.1 PURPOSE****  
** This module allows temples and system admins to broadcast important updates to members.  
  
 **4.14.2 TYPES****  
** - Temple-specific announcements  
 - System-wide (to all members) announcements  
  
 **4.14.3 STRUCTURE****  
** Each announcement should include:  
 - Title  
 - Description  
 - Posted by (Which Temple/Dharamshala/Jinanam System)  
 - Date & Time  
 - Attachments if any  
  
 **4.14.4 TARGETING****  
** - Temple announcements: They should have below two option before submitting  
 → Visible to linked members  
 → Visible to all members

  
 - System announcements: Two options  
 → Visible to all members  
 → Visible to Specific group filtered by city, state, country, pincode. Etc.

  
 **4.14.5 MEMBER FLOW****  
** - View announcements  
 - Click to read full details  
  
 **4.14.6 NOTIFICATIONS****  
** - Push notification on new announcement  
 - Important announcements marked priority  
  
 **4.14.7 RULES****  
** - Editable by admin  
 - Historical announcements remain visible  
  
 **4.14.8 EDGE CASES****  
** - Deleted announcement → removed  
 - Expired → optional auto-hide

 

**4.15 MEMBER LINKING**

**4.15.1 PURPOSE****  
** This module allows members to connect with temples/dharmshalas to receive personalized updates and notifications.  
  
 **4.15.2 LINKING STRUCTURE**

**Temple/Dharamshala****  
** Each member must select:  
 - In their profile there should always be one Temple linked by default i.e. Jain Music Fest. (Create this if you want and give admin access like temple and this should be Linked to all the members by default. Apart from this follow below.

- For members, 1 mandatory temple they must select, 2 optional Primary Temples/Dharmshalas  
 - And up to 6 Secondary Temples/Dharmshalas

**Monks**

Each member must select:  
 - 1 Primary monk they believe and 9 secondaries.

So, the route update, travelling notifications to be sent to those linked members only.

E.g. If the member is linked with ABC Monk, then the updates via app notifications (valid for 24hrs) of ABC monk should be sent to that member only.

Another E.g. If 250 members are registered and out of that only 100 members are linked with ABC monk, then the updates related ABC monk to be sent to 100members via app notification.

  
 **4.15.3 ONBOARDING FLOW****  
** 1. After registration, user is prompted to select temples (1 should be by default and 1 should be mandatory, and 8 optional)  
 2. User selects:

- Default  
 - Primary  
 - Secondary  
 3. Data is saved to user profile  
  
 **4.15.4 FEATURES****  
** - Personalized feed based on linked temples  
 - Receive announcements from linked temples on priority  
 - Receive event updates from linked temples/dharmshalas  
 - Receive monk journey alerts  
  
 **4.15.5 RULES****  
** - Minimum 1 primary selections required for Temple and monk  
 - Members can update linking anytime through their settings  
 - No duplication allowed  
  
 **4.15.6 DATA USAGE****  
** Linked temples will be used for:  
 - Feed personalization  
 - Notification targeting  
 - Event recommendations  
  
 **4.15.7 EDGE CASES****  
** - Temple becomes inactive → remove from linking  
 - Member removes temple → stop notifications

 

**4.16 DONATIONS**

**4.16.1 PURPOSE****  
** This module enables members to make donations to temples/dharmshalas and to the Jinanam platform, ensuring transparency and proper verification.  
  
 **4.16.2 TYPES OF DONATIONS****  
** 1. Temple/Dharamshala Donation (Manual)  
 2. Jinanam Platform Donation (Online via Payment Gateway)

3. Jain Music Festival Donation (Online via Payment Gateway)  
  
 **4.16.3 TEMPLE DONATION FLOW (MANUAL)****  
** 1. Member selects temple  
 2. Views bank/UPI details  
 3. Makes payment externally  
 4. Enters transaction reference number and amount  
 5. Uploads payment proof (screenshot)

6. Select Categories (Multiple option) – like General, Gau Seva, and so on (these categories will create/edit by individual temple/Dharamshala only) – Totals amount.

Once the categories are created and receipts are generated in those categories then it will not be edited/deleted. Only super admin will have that right to edit and delete. If any category was created but receipts under thode category is not generated, then admin can edit/delete those.

7. Total Amount should match with entered amount.  
 8. Submission created with status: "Pending"  
 9. Admin verifies:  
 - Mark as Verified / Rejected  
 10. Auto Receipt generated (on verification)  
  
 **4.16.4 COUNTER DONATION (ADMIN ENTRY)****  
** - Temple admin can:  
 - Enter offline donation received at temple  
 - Fill donor details  
 - Generate receipt  
 - Receipt becomes visible in member app (if linked)  
  
 **4.16.5 Jinanam DONATION (ONLINE)****  
** 1. At Top/start Display message (Message will be created by Super Admin and change right to be given to the Super admin)

2. Member enters amount  
 3. Payment via payment gateway  
 4. Payment success → auto confirmation  
 5. Receipt generated instantly

 

**JAIN MUSIC FESTIVAL (ONLINE)****  
** 1. At Top/start Display message (Message will be created by Super Admin and change right to be given to the Super admin)

2. Member enters amount  
 3. Payment via payment gateway  
 4. Payment success → auto confirmation  
 5. Receipt generated instantly

(Short note in the receipt that at the end of the FY they will get the 10BE certificate of 80g benefit over an email provided)

  
 **4.16.6 RECEIPT STRUCTURE****  
** Each receipt must include:  
 - Temple/Dharamshala name  
 - Registration number  
 - Member number and Name  
 - Amount  
 - Date  
 - Authorized signatory  
 - Stamp  
 - 80G eligibility (Yes/No)  
  
 **4.16.7 MEMBER FEATURES****  
** - View donation history  
 - Download receipts anytime  
 - Track donation status  
  
 **4.16.8 VALIDATION RULES****  
** Prevent duplicate submission using same:  
 - Screenshot  
 - Transaction reference  
 - Mandatory fields must be filled  
  
 **4.16.9 PAYMENT RECONCILIATION****  
** - Admin should:  
 - Match payment proof with transaction details  
 **Maintain logs of:****  
** - Verified  
 - Rejected  
 - All actions logged in audit system  
  
 **4.16.10 EDGE CASES****  
** - Invalid screenshot → reject  
 - Payment uploaded but not verified → show "Pending"  
 - Duplicate submission → block or flag

 

**4.17 NOTIFICATIONS**

**4.17.1 PURPOSE**

To ensure timely communication and updates to users across all critical actions in the system.

 

**4.17.2 NOTIFICATION CHANNELS**

- In-App Notifications

- Push Notifications

- WhatsApp Notifications

- SMS (fallback)

 

**4.17.3 NOTIFICATION TYPES**

**1. System Notifications**

- Alerts

- Updates

**2. Transaction Notifications**

- Booking confirmation

- Donation verification

**3. Event Notifications**

- Event created

- Event reminder

**4. Journey Notifications**

- Monk nearby

- Arrival alerts

**5. Announcement Notifications**

- Permanent announcements

- Push-only temporary announcements (24-hour visibility)

 

**4.17.4 TRIGGERS**

- Booking confirmed

- Booking cancelled

- Donation verified

- Event created

- Announcement posted

- Monk arrival (24hr & 2hr)

- SOS alert

- Daily Tithi notification (morning)

- Daily Count 3 Navkar notification (morning)

 

**4.17.5 PRIORITY LEVELS**

**High Priority:**

  - SOS alerts

  - Critical system alerts

**Medium:**

  - Booking updates

  - Donations

  - Announcements

**Low:**

  - Feed updates

  - Offers

 

**4.17.6 DELIVERY RULES**

**Notifications must:**

  - Be sent instantly for critical events

  - Be batched for low priority (optional)

  - Avoid duplicate notifications

**Push notifications should:**

  - Be delivered reliably

  - Open relevant screen on click

 

**4.17.7 PUSH-ONLY TEMPORARY NOTIFICATIONS (24-HOUR)**

Admin can send push-only notifications that:

  - Visible only in notification section

  **Are NOT stored in:**

  - Feed

  - Announcement list

**Validity:**

  - Automatically expire after 24 hours

  - Removed from UI after expiry

**Fields:**

  - Title

  - Message

  - Priority (optional)

 

**4.17.8 USER CONTROL**

**User can:**

  - Enable/disable certain notifications

  - Set preferences

 

**4.17.9 EDGE CASES**

- Notification failure → retry or fallback

- WhatsApp failure → use SMS (optional)

- Duplicate trigger → prevent duplicate notification

- Expired push notification → auto remove from UI

 

**4.18 SEARCH & FILTER**

**4.18.1 PURPOSE****  
** To allow users to quickly find relevant data across the platform.  
  
 **4.18.2 SEARCH FUNCTIONALITY****  
** Search should support:  
  
 - Monks (by name)  
 - Temples (by name, city)  
 - Events (by title)  
 - Tours (by name/location)  
  
 **4.18.3 FILTER OPTIONS****  
** **Events:****  
** - City  
 - Date  
 - Temple  
  
 **Temples:****  
** - City  
 - Facilities (optional future)  
  
 **Monks:****  
** - Status (Moving / Idle / Offline)  
  
 **Donations:****  
** - Date  
 - Temple  
 - Status  
  
 **Bookings:****  
** - Date  
 - Temple  
 - Status  
  
 **4.18.4 USER EXPERIENCE****  
** - Search bar at top  
 - Instant results (auto-suggest optional)  
 - Filters accessible via dropdown or panel  
  
 **4.18.5 RULES****  
** - Search should return relevant results  
 - Filters should be combinable (e.g., City + Date)  
  
 **4.18.6 EDGE CASES****  
** - No results → show "No data found"  
 - Invalid search → show suggestions

 

**4.19 MANUAL ROUTE SYSTEM**

**4.19.1 PURPOSE****  
** This module provides a fallback tracking system where temple admins can manually update the journey of monks when GPS tracking is unavailable or not used.  
  
 **4.19.2 JOURNEY CREATION (ADMIN FLOW)****  
** Temple Admin creates a journey with:  
 - Monk Name  
 - Start Temple  
 - Next Temple (Destination)  
 - Full Route (A → B → C → D)  
 - Journey Start Date & Time  
 - Expected Arrival Date & Time  
 - Notes (optional)  
  
 **4.19.3 SYSTEM BEHAVIOR****  
** - Once journey is created:  
 - Notify destination temple  
 - Notify all upcoming temples in route  
 - Display journey in admin dashboard  
 - Display in member app  
  
 **4.19.4 JOURNEY PROGRESSION****  
** **At each step:****  
** - Temple Admin updates status:  
 - Arrived  
 - Delayed  
 - Proceeded  
 - System updates:  
 - Timeline  
 - Logs  
 - Notifications  
  
 **4.19.5 MEMBER EXPERIENCE****  
** **Members can:****  
** - View journey route  
 - View expected arrival  
 - Track current stage  
  
 **4.19.6 ARRIVAL NOTIFICATIONS****  
** Members linked with destination temple should receive:  
 - Notification 24 hours before arrival  
 - Notification 2 hours before arrival

  
  
 **4.19.7 RULES****  
** - Manual tracking must update journey logs  
 - Works independently or alongside GPS tracking  
 - Status updates are mandatory at each step  
  
 **4.19.8 EDGE CASES****  
** - Delay update → notify next temple  
 - Journey cancelled → notify all stakeholders  
 - Incorrect update → allow admin correction (logged)

 

**4.20 ERROR HANDLING**

**4.20.1 PURPOSE****  
** Ensure the system handles failures gracefully and provides clear feedback to users.  
  
 **4.20.2 GENERAL PRINCIPLES****  
** - Errors must be:  
 - Clear  
 - User-friendly  
 - Actionable  
  
 **4.20.3 COMMON ERROR SCENARIOS****  
** **1. Booking Errors:****  
** - Room not available  
 - Payment timeout  
 - Duplicate booking  
  
 **2. Payment Errors:****  
** - Payment failed  
 - Invalid screenshot upload  
  
 **3. Network Errors:****  
** - No internet connection  
 - API failure  
  
 **4. Authentication Errors:****  
** - Invalid OTP  
 - Session expired  
  
 **4.20.4 SYSTEM RESPONSE****  
** - Show clear error message  
 - Provide retry option where applicable  
 - Prevent system crash  
  
 **4.20.5 EXAMPLES****  
** - "Payment not received. Please try again."  
 - "Room already booked. Please select another option."  
 - "Network error. Please check your connection."  
  
 **4.20.6 LOGGING****  
** - All errors should be logged in backend  
 - Critical errors should be visible to admin  
  
 **4.20.7 EDGE CASES****  
** - Partial failures (e.g., payment success but no confirmation)  
 → System should reconcile and notify admin

 

**4.21 PERFORMANCE REQUIREMENTS**

**4.21.1 PURPOSE****  
** Ensure the application delivers a smooth, fast, and reliable experience for all users.  
  
 **4.21.2 PERFORMANCE REQUIREMENTS****  
** - Screen load time:  
 - \< 3 seconds for most screens  
 - API response time:  
 - \< 2 seconds  
 - Tracking updates:  
 - Reflect based on configured interval

  
 **4.21.3 UI/UX EXPECTATIONS****  
** - Clean and minimal design  
 - Easy navigation  
 - Clear buttons and actions  
 - Minimal typing (more selection-based inputs)  
  
 **4.21.4 RESPONSIVENESS****  
** - Mobile-first design  
 - Works across:  
 - Android  
 - iOS  
 - Web browsers  
  
 **4.21.5 FEEDBACK SYSTEM****  
** - Show loading indicators for actions  
 - Show confirmation messages:  
 - Booking successful  
 - Donation submitted  
  
 **4.21.6 ERROR EXPERIENCE****  
** - Errors should not block entire app  
 - Allow retry wherever possible  
  
 **4.21.7 SCALABILITY IN UX****  
** - UI should support:  
 - Large number of temples  
 - Large data lists (pagination required)  
  
 **4.21.8 EDGE CASES****  
** - Slow network → show loading state  
 - Large data → use pagination or lazy loading

 

**4.21 TITHI CALENDAR (SPIRITUAL CALENDAR)**

**4.21.1 PURPOSE**

This module provides a structured spiritual calendar system where daily Jain tithi information (such as Poonam, Amavasya, etc.) is managed centrally by Super Admin and displayed to Temple Admins and Members based on their selected calendar preference.

 

**4.21.2 CALENDAR TYPES (SUPER ADMIN SETUP)**

Super Admin will create and manage multiple calendar types such as:

- Gujarati Calendar

- Kutchi Calendar

- Marwari Calendar

- Hindi Calendar

- Others

Each calendar will be independent and configurable.

 

**4.21.3 CALENDAR DATA MANAGEMENT (SUPER ADMIN)**

For each calendar type, Super Admin will:

- Add entries for all 365 days (year-wise)

- Define for each date:

   - Gregorian Date (e.g., 1 April 2026)

   - Tithi Name (e.g., Poonam, Amavasya)

   - Description

Edit or update entries if required

 

**4.21.4 TEMPLE ADMIN EXPERIENCE**

- Temple Admin will have access to Tithi Calendar in their portal by default

- Calendar displayed based on system default or selected type

 

**4.21.5 TEMPLE ADMIN NOTIFICATIONS**

- Temple Admin should receive:

   - Daily notification in the morning

   - Example:

  "Today is Poonam" and short description/message.

 

**4.21.6 CORRECTION / TICKET SYSTEM**

If Temple Admin finds incorrect calendar data:

- They can raise a correction request (ticket)

 

Ticket should include:

- Date

- Calendar type

- Issue description

 

**4.21.7 SUPER ADMIN TICKET MANAGEMENT**

Super Admin can:

- View all tickets

- Take action:

- Approve correction

- Reject request

- Update calendar data if required

- Close ticket after resolution

 

**4.21.8 MEMBER CALENDAR SELECTION**

During profile creation:

- Member must select preferred calendar:

- Gujarati / Kutchi / Marwari / etc.

 

This selection will define:

   - Calendar view

   - Notification content

**4.21.9 MEMBER EXPERIENCE**

Members should be able to:

- View calendar in app menu

See:

- Today's Tithi

- Monthly calendar view

- Default calendar = selected preference

- Option to view other calendar types (optional)

 

**4.21.10 MEMBER NOTIFICATIONS**

Members receive daily notification:

- Based on selected calendar

- Example: "Today is Poonam" and short description/msg if any

 

**4.21.11 SETTINGS (CHANGE CALENDAR)**

- Member can change calendar type in settings

- After change:

   - Future notifications follow new selection

   - Calendar view updates accordingly

 

**4.21.12 DASHBOARD INTEGRATION**

- Display "Today's Tithi" on dashboard

Example:

   "Today: Poonam"

 

**4.21.13 RULES**

- Tithi must be shown based on:

   - User-selected calendar

   - Current date

- Calendar data is centrally controlled by Super Admin

 

**4.21.14 EDGE CASES**

- Missing data → show "No tithi available"

- Multiple calendars for same date → show based on user selection

- Incorrect data → corrected via ticket system

- Calendar change → immediate effect on notifications

 

**4.22 SPIRITUAL COUNTING (DIGITAL MALA / TRACKER)**

**4.22.1 PURPOSE****  
** This module allows members to digitally track their spiritual activities such as mantra chanting, pooja, Jatra, and other religious practices.  
  
 It acts as a replacement for traditional mala or physical counting devices by providing a simple in-app counting mechanism.  
  
 **4.22.2 COUNTER TYPES (SUPER ADMIN CONTROL)****  
** Super Admin will create and manage different counting **categories** such as:  
 - Mantra

- TAP

- Jatras

- Jain Visits

Super Admin will create and manage different counting **sub-categories** such as:

**In Mantras**

- Navkar Mantra  
 - Logas  
  
  

**In Jatras**

- Palitana Jatra  
 - Girnar Jatra  
 - Sammed Shikharji Jatra  
  
  

**- Jain Temple Visits****  
****  
  
**

Each counter type should be dynamically manageable.  
  
 **4.22.3 MEMBER INTERFACE****  
** - Counters should be displayed as cards (grid/list view)  
 - Each card should include:  
 - Counter Name  
 - Current Count  
 - "+" button (increment)  
 - "−" button (decrement)  
  
 **4.22.4 COUNTING FLOW****  
** - Member clicks "+" → count increases by 1  
 - Member clicks "−" → count decreases by 1 (optional validation to prevent negative values)  
  
 Counting should be:  
 - Instant (real-time update)  
 - Saved automatically  
  
 **4.22.5 RESET FUNCTIONALITY****  
** - Members can reset their counts from settings  
 - Reset should:  
 - Apply to individual counter OR all counters (optional)  
 - Require confirmation before reset  
  
 **4.22.6 DATA STORAGE****  
** - Each member’s count should be:  
 - Stored separately per counter type  
 - Persisted across sessions  
 **4.22.7 TEMPLE ADMIN ACCESS****  
** Temple Admin should be able to:  
 - View counts of members linked to their temple (Primary linked members only)  
 - Access summary such as:  
 - Total counts per member  
 - Total counts per counter type  
  
 **4.22.8 REPORTS (ADMIN)****  
** **Temple Admin can:****  
** - Download reports including:  
 - Member Name  
 - Counter Type  
 - Total Count  
 - Date range  
  
 **Use reports for:****  
** - Engagement tracking  
 - Recognition (e.g., top contributors)  
  
 **4.22.9 LEADERBOARD****  
** Show top members based on counts  
 - Based on:  
 - Individual counters  
 - Overall activity  
  
 **4.22.10 RULES****  
** - Count should not go below zero  
 - All updates should be saved instantly  
 - Counter types are controlled only by Super Admin  
  
 **4.22.11 NOTIFICATIONS****  
** - Reminders for daily practice  
 - Milestone achievements (e.g., 1000 counts completed)  
  
 **4.22.12 EDGE CASES****  
** - App closed during counting → data must persist  
 - Rapid clicking → prevent duplicate/missed increments  
 - Reset action → confirm before execution

 

**5. ADMIN PORTAL (WEB APPLICATION)**

**5.1 OVERVIEW**

The Admin Portal is the central control system of the Jinanam platform.

**It is designed for:**

- Super Admin

- Temple Admin

- Dharmshalas Admin

**The portal will be:**

- Web-based (desktop-first, responsive)

- Data-driven

- Role-based

- Action-oriented (fast operations)

 

**5.2 GENERAL UI/UX REQUIREMENTS**

Sidebar navigation for modules

**Top header with:**

- Notifications

- Profile

- Quick actions

**Dashboard-first approach**

- Table-based data views

- Filters and search in every module

- Minimal clicks for actions

 

**5.3 DASHBOARD**

**5.3.1 PURPOSE**

Provide a real-time overview of system activity and critical alerts.

 

**5.3.2 COMPONENTS**

**1. Live Stats (Top Cards):**

- Total Monks

- Active Journeys

- Today's Arrivals

- Total Donations

**2. Alerts Panel:**

- SOS alerts

- Route delay alerts

**Color Coding:**

- Red → Critical

- Orange → Warning

**3. Incoming Monks:**

- Monk Name

- From Temple → To Temple

- Expected Arrival Time

- Status (On Time / Delayed)

**4. Quick Actions:**

- Add Monk

- Create Route

- Create Event

- Add Booking

 

**5.4 PERSONS (MONK MANAGEMENT)**

**5.4.1 FEATURES**

- Create monk profile

- Edit monk profile

- Assign device

- View journey history

 

**5.4.2 FIELDS (refer separate word file for the same)**

- Name

- Photo

- Current Temple

- Description

- Status

- Emergency Contact

 

**5.4.3 RULES**

- Shared profile across temples

- Editable by all temple admins

- Delete only by Super Admin

 

**5.4.4 AUDIT LOGS**

**Track:**

- Who edited

- What changed

- Timestamp

 

**5.5 LIVE TRACKING**

**5.5.1 FEATURES**

- Map with monk markers

Status colors:

- Green → Moving

- Yellow → Idle

- Red → Offline

 

**5.5.2 DETAILS ON CLICK**

- Monk name

- Battery level

- Last update

- Route

 

**5.5.3 FILTERS**

- Temple

- Route

- Status

- Region

 

**5.6 ROUTES MANAGEMENT**

**5.6.1 FEATURES**

**Create route:**

- A → B → C → D

**Add:**

  - Journey date/time

  - Expected arrival

 

**5.6.2 TRACKING**

- Completed steps

- Delayed steps

- Pending steps

 

**5.7 JOURNEY LOGS**

**5.7.1 FEATURES**

- Timeline view

- Logs of:

- Departure

- Arrival

- Delays

 

**5.7.2 OUTPUT**

- Journey reports

- Delay reports

 

**5.8 TEMPLE MANAGEMENT**

**5.8.1 FEATURES**

- Create/edit temple

- Add details:

- Location

- Contact

- Rules

- Bank details

 

**5.8.2 ADMIN ASSIGNMENT**

- Assign admins

- Manage roles

 

**5.8.3 RULES**

- Only Super Admin creates temple

- No deletion by temple admin

 

**5.9 ACCOMMODATION MANAGEMENT**

**5.9.1 FEATURES**

- Add rooms/halls

- Define:

  - Capacity

  - Price

  - Rules

 

**5.9.2 BOOKING MANAGEMENT**

- View bookings

- Approve/reject

- Track occupancy

 

**5.10 EVENTS MANAGEMENT**

**5.10.1 FEATURES**

- Create event

- Edit event

- View participants

 

**5.10.2 FIELDS**

- Title

- Date/time

- Temple

- Description

 

 

**5.11 FREE EVENTS**

**5.11.1 FEATURES**

- RSVP list

- Attendance tracking

 

**5.11.2 ANALYTICS**

- Participation graph

 

**5.12 PAID EVENTS**

**5.12.1 FEATURES**

- Ticket management

- QR generation

 

**5.12.2 RULES**

- Only Super Admin can create

- Payment gateway required

 

**5.13 TOURS MANAGEMENT**

**5.13.1 FEATURES**

- Create tours

- Manage participants

 

**5.14 VOLUNTEERS MANAGEMENT**

**5.14.1 FEATURES**

- Define requirement

- Approve applicants

- Assign roles

 

**5.15 MEMBERS MANAGEMENT**

**5.15.1 FEATURES**

- View profiles

Track activity:

  - Active

  - Inactive

 

**5.15.2 REPORTS**

- Active vs inactive users

 

**5.16 DEVICES & SIM MANAGEMENT**

**5.16.1 FEATURES**

- Device list:

  - ID

  - Assigned monk

  - Status

 

**5.16.2 SIM MANAGEMENT**

- Operator

- Validity

- Expiry alerts

 

**5.17 BATTERY & ALERT SYSTEM**

**5.17.1 FEATURES**

- Monitor battery

- Generate alerts

 

**5.18 DONATION MANAGEMENT**

**5.18.1 FEATURES**

- View donations

- Verify/reject

- Generate receipts

 

**5.18.2 RECEIPT FORMAT**

- Temple name

- Registration number

- Signature

- Stamp

- 80G info

 

**5.19 COMMUNICATION SYSTEM**

**5.19.1 FEATURES**

- Chat between temples

- Broadcast messages

 

**5.19.2 RULES**

- No deletion by admins

- Only Super Admin can delete

- Messages permanent

 

**5.20 TEMPLE NETWORK**

**5.20.1 FEATURES**

- Incoming monks

- Outgoing monks

- Journey visibility

 

**5.21 REPORTS & ANALYTICS**

**Reports:**

- Donations

- Journeys

- Devices

- Members

 

**5.22 SETTINGS**

**5.22.1 FEATURES**

- Role management

- Alert configuration

- Notification settings

 

**5.23 AUDIT LOGS**

**5.23.1 PURPOSE**

Ensure accountability

**5.23.2 TRACK**

- Donation verification

- Booking approval/rejection

- Route updates

- Device assignment

- Admin actions

 

**5.23.3 FIELDS**

- User

- Action

- Module

- Timestamp

 

**6. SYSTEM LOGIC**

 

**6.1 OVERVIEW**

This section defines the core logic, rules, workflows, and system behaviors that govern how the Jinanam platform operates.

**It includes:**

- Tracking logic (GPS + manual)

- Booking logic

- Donation logic

- Notification logic

- Alert system

- Data validation

- Edge case handling

All logic must be implemented consistently across both Admin Portal and Member Platform.

 

**6.2 TRACKING LOGIC**

**6.2.1 GPS/NAVIGATION-BASED TRACKING**

- Navigation assigned to monk’s personal assistant send location data at configured intervals (30–60 minutes initially)

- Data includes:

- Latitude

- Longitude

- Timestamp

- Device ID

**System Behavior:**

- Backend receives location data

- Updates monk’s latest location

- Displays on:

- Admin dashboard

- Member app (map view)

**Offline Detection:**

- If no update is received within defined threshold:

- Mark monk/device as "Offline"

- Trigger alert

 

**6.2.2 MANUAL TRACKING**

**Purpose:**

- Used when GPS is unavailable or intentionally not used

**Flow:**

1. Temple Admin creates journey:

   - Monk Name

   - Start Temple

   - Next Temple

   - Journey start date/time

   - Expected arrival date/time

 

2. System notifies:

   - Destination temple

   - All upcoming temples in route

 

3. Destination temple updates:

   - Arrived / Delayed / Proceeded

 

4. Journey continues step-by-step:

   - A → B → C → D

 

**Rules:**

- Manual tracking must reflect in:

- Journey logs

- Member app

- Manual and GPS tracking should work independently or together

 

**6.3 ALERT SYSTEM**

**6.3.1 ALERT TYPES**

- Device Offline Alert

- No Movement Alert

- Route Delay Alert

- SOS Alert (highest priority)

 

**6.3.2 ALERT PRIORITY**

- Critical → SOS, Device Offline

- Warning → Battery, Delay

 

**6.3.3 ALERT BEHAVIOR**

- Alerts must be:

- Visible on dashboard

- Sent as notifications

- Alerts should not be repeated excessively

 

**6.4 BOOKING LOGIC**

**6.4.1 BOOKING FLOW**

1. Member selects room/hall

2. Booking request created

3. Payment details shown

4. Member uploads payment proof

5. Admin verifies

6. Booking confirmed

 

**6.4.2 PAYMENT RULE**

- Payment must be completed within 1 hour

**If not:**

  - Booking auto-cancelled

  - Slot released

 

**6.4.3 VALIDATION**

- Prevent double booking

- Ensure availability before confirmation

 

**6.4.4 STATUS**

- Pending

- Payment Pending

- Confirmed

- Cancelled

 

**6.5 DONATION LOGIC**

**6.5.1 TYPES**

- Temple Donation (Manual)

- Jinanam Donation (Online)

 

**6.5.2 FLOW (MANUAL)**

1. Member views bank details

2. Makes payment externally

3. Uploads screenshot

4. Admin verifies

5. Receipt generated

 

**6.5.3 VALIDATION**

- Prevent duplicate payment submission

- Validate screenshot and transaction details

 

**6.5.4 RECEIPT**

- Generated only after verification

- Stored and accessible in member app

 

**6.6 EVENT LOGIC**

**6.6.1 RSVP**

- Members can register

- Admin can view participant list

 

**6.6.2 CAPACITY CONTROL**

- Admin defines max capacity

- Once reached:

- Disable further registration

 

**6.6.3 PAID EVENTS**

- Payment required before confirmation

- QR code generated per booking

 

**6.7 NOTIFICATION LOGIC**

**6.7.1 TRIGGERS**

- Booking confirmation

- Booking cancellation

- Donation verification

- Event creation

- Monk nearby

- SOS alert

 

**6.7.2 CHANNELS**

- App notifications

- WhatsApp

- SMS (optional)

**6.7.3 ARRIVAL NOTIFICATIONS**

- 24 hours before arrival

- 2 hours before arrival

 

**6.8 DATA VALIDATION**

- Mandatory fields must be validated

- Invalid inputs should be rejected

- Duplicate entries should be prevented

 

**6.9 EDGE CASE HANDLING**

- Device offline → Show last known location

- Payment not verified → Show "Pending"

- Duplicate payment → Reject

- Booking not paid → Auto cancel

- Network failure → Retry or show error

 

**6.10 DATA CONSISTENCY**

- All updates must be synchronized across:

- Admin portal

- Member app

- Data must be consistent and up to date

 

**6.11 SECURITY LOGIC**

- Role-based access enforcement

- API validation for every request

- Sensitive data protection

 

**6.12 PERFORMANCE LOGIC**

- System should handle multiple concurrent users

- Optimize API response time

- Avoid delays in tracking updates

 

**7. NON-FUNCTIONAL REQUIREMENTS**

**7.1 OVERVIEW**

This section defines the quality, performance, security, and operational expectations of the Jinanam platform.

These requirements ensure that the system is:

- Reliable

- Secure

- Scalable

- Fast

- User-friendly

These are mandatory and must be considered during system design and development.

 

**7.2 PERFORMANCE REQUIREMENTS**

**7.2.1 RESPONSE TIME**

- All API responses should be fast (preferably \< 2 seconds)

- Critical actions (tracking updates, booking confirmation) should be near real-time

 

**7.2.2 LOAD HANDLING**

- System should handle multiple concurrent users without performance degradation

- Must support:

- Multiple temples

- Large number of members

- Simultaneous tracking updates

 

**7.2.3 OPTIMIZATION**

- Efficient database queries

- Proper indexing

- Caching where required

 

**7.3 SCALABILITY**

**7.3.1 HORIZONTAL SCALING**

- System should be designed to scale across:

- Cities

- States

- Regions

 

**7.3.2 USER SCALING**

- Should support growth in:

- Members

- Admins

- Devices

 

**7.3.3 MODULAR ARCHITECTURE**

- Backend should be modular

- Easy to add new features in future

 

**7.4 RELIABILITY & AVAILABILITY**

**7.4.1 UPTIME**

- System should aim for high availability (99.99%+ uptime)

 

**7.4.2 FAILSAFE MECHANISMS**

- Manual tracking should act as fallback if GPS fails

- System should handle:

- Device failures

- Network issues

- API failures

 

**7.4.3 ERROR RECOVERY**

- System should recover gracefully from failures

- Retry mechanisms for:

- API failures

- Notification failures

 

**7.5 SECURITY REQUIREMENTS**

**7.5.1 AUTHENTICATION**

- Secure login via OTP and password

- Session management required

 

**7.5.2 AUTHORIZATION**

- Role-based access control (RBAC)

- Strict enforcement of permissions

 

**7.5.3 DATA SECURITY**

- Sensitive data must be protected:

- Personal details

- Payment details

 

**7.5.4 API SECURITY**

- All APIs must validate:

- User identity

- Role permissions

 

**7.6 DATA MANAGEMENT**

**7.6.1 DATA CONSISTENCY**

- Data must remain consistent across:

- Admin portal

- Member app

 

**7.6.2 DATA VALIDATION**

- Mandatory fields must be enforced

- Prevent invalid or duplicate data

 

**7.6.3 DATA STORAGE**

- Centralized database

- Proper schema design

 

**7.7 BACKUP & RECOVERY**

**7.7.1 BACKUP**

- Regular automated backups

- Backup frequency:

- Daily (minimum)

 

**7.7.2 RECOVERY**

- Ability to restore data in case:

- System failure

- Data corruption

 

**7.8 NOTIFICATION SYSTEM RELIABILITY**

Notifications should be:

- Delivered reliably

- Not duplicated unnecessarily

**Fallback:**

- If WhatsApp fails → Use SMS

 

**7.9 USABILITY**

**7.9.1 USER EXPERIENCE**

- Simple and intuitive UI

- Minimal steps for actions

- Clear navigation

 

**7.9.2 ACCESSIBILITY**

- Mobile-friendly design

- Easy for non-technical users

 

**7.10 AUDIT & LOGGING**

**7.10.1 LOGGING REQUIREMENTS**

All critical actions must be logged:

- User actions

- System events

 

**7.10.2 AUDIT TRAIL**

Logs must include:

- User ID

- Action

- Timestamp

- Module affected

 

**7.11 ERROR HANDLING**

System should display:

- Clear and user-friendly error messages

**Examples:**

- Payment failed

- Booking failed

- Network issue

 

**7.12 COMPATIBILITY**

Web apps should work on:

- Chrome

- Safari

- Edge

- Mobile app:

- Android

- iOS

 

**7.13 MAINTENANCE & UPDATES**

System should support:

- Easy updates

- Bug fixes without downtime

 

**7.14 FUTURE READINESS**

System should allow:

- Integration of new features

- Expansion to new use cases

- Scaling to other regions

 

**Unique ID Generation System**

To ensure consistency, traceability, and structured data management across the platform, all entities within Jinanam must follow a **system-generated, sequential ID format**. Random or user-defined IDs will not be permitted.

**1. ID Generation Rules**

  - All IDs will be **auto generated by the system** upon creation of a new record.
  - IDs must follow a **fixed prefix + sequential numbering format**.
  - Numbering should always be **continuous and incremental**, starting from the defined base.
  - IDs once generated:
      
      - **Cannot be edited or changed**
      - **Cannot be deleted or reused**
  - No manual overrides or random number generation will be allowed.

 

**2. Entity-wise ID Structure**

|  |  |  |
| :-: | :-: | :-: |
| **Entity Type** | **Prefix** | **Starting Format Example** |
| Temples | VT | VT000108 |
| Dharamshala’s | VD | VD000108 |
| Jain Centre | VJC | VU000108 |
| Monks | VMS | VMS000108 |
| Members | VM | VM0000108 |

 

**3. Entity-Specific Logic**

**a. Temples (VT)**

  - When a temple is registered by the Super Admin, the system should automatically assign a unique ID.
  - ID format: VT + 6-digit sequence
  - Example: VT000108, VT000208, ...

**b. Dharamshala’s (VD)**

  - Auto generated upon creation.
  - ID format: VD + 6-digit sequence

**c. Upashray (VU)**

  - Auto generated upon creation.
  - ID format: VU + 6-digit sequence

**d. Members (VM)**

  - Every registered user must have a **unique Member ID**.
  - ID format: VM + 7-digit sequence
  - Example: VM0000108, VM0000208, ...
  - This ID will act as the **primary identifier** for all users across the platform.

 

**4. Member Management Rules**

  - Member IDs:
      
      - Are **permanent and immutable**
      - Cannot be edited by users
  - **Deletion of members**:
      
      - Allowed **only for Super Admin**
  - If Super Admin adds members:
      
      - Each member must receive a **new unique sequential ID**
      - The sequence must continue (no resets or reuse)

 

**5. Key Constraints**

  - No duplicate IDs across the system
  - No gaps caused by reuse of deleted IDs
  - IDs must be **globally unique per entity type**
  - System must ensure **high reliability and atomicity** during ID generation

 

 

 

**Below are the points which we highlighted but may not be mentioned above, so do consider this as well:**

-          Weekly APP Rating popup to the members, if they have rated then it should not pop up to them. But it hasn’t then weekly once.

-          In menu - Help section on how to use this app and its features

-          In Temple we need to add member notifications section – so If any member passing within the radius of 5km of the temple they should get push notifications of nearby temple.

-          Accommodation – A- option of multiple building – so in Dharamshala there are multiple buildings so we want an option where dharmshala will create buildings and name them then add the room/halls details to it. So, members can view that dharmshala and options of buildings and room availability into it.

-          Instead of Monks use term “**MS”**

-          Instead of Accommodation use term **“Dharamshala”**

-          Instead of Temple use term **“Derasar”**

-          Add one more option of bhojanalay List under Temple or separate – In this those temples fill yes for bhojanalay that should be listed here, just those only to view the details. For now, No action, only detail’s view.

-          Add one option of Pathshala Centers under Temple or separate – In this Super Admin will add the details of the centers like name, address with city, state, country and all, contact person will be linked through member and contact details to be viewed in this. As of now No action to members they will just view the details and call them for more information.

**1. PROJECT OVERVIEW**

 

**1.1**   **DETAILS**

Project Name: Jinanam (This is a temporary name – Will share the final name later)

Tagline: Safety, Seva, & Support for Every Jinanam 

 

**1.2**   **CORE OBJECTIVES**

The platform is designed with the following primary objectives:

 

**1. Monk Safety:**

   - Provide tracking (GPS + manual)

   - Generate alerts for risk scenarios (offline, delays, SOS)

**2. Journey Management:**

   - Plan routes between temples

   - Maintain journey timelines and logs

   - Notify upcoming temples and members

**3. Temple Coordination:**

   - Enable seamless communication between temples

   - Manage incoming and outgoing monks

   - Provide shared monk data system

**4. Devotee Engagement:**

   - Allow members to track monks

   - Participate in events, tours, and seva

   - Receive announcements and updates

**5. Donation Transparency:**

   - Manual and digital donation tracking

   - Verification workflow

   - Receipt generation with compliance details

**6. Accommodation Management:**

   - Room and hall booking in Dharmshala

   - Availability tracking

   - Payment and verification workflow

 

 

**7. Community Platform:**

- Feed, polls, announcements

- Volunteer participation

- Offers and engagement

 

**1.3 PLATFORM COMPONENTS**

The system will consist of two primary platforms:

**A. Admin Portal (Mobile App + Web)**

Used by:

- Super Admin

- Temple Admin

- Dharmshalas Admin

- JC (Jain Center) Admin

(Provide option where Super Admin Will define the allocation of features)

 

Purpose:

- Full system control

- Data management

- Monitoring and operations

 

**B. Member Platform (Mobile App + Web)**

   Used by:

   - Devotees / Members

 

   Purpose:

   - Track monks

   - Engage with temples

   - Participate in events and bookings

   - Make donations

 

**1.4 SYSTEM APPROACH**

The system will support two tracking approaches:

**1. Manual Journey Tracking:**

   - Temple admins manually create journey

   S**ystems should:**

- Work independently

- Be visible at the same interface

- Maintain consistent journey logs

 

**1.5 TARGET USERS**

**1. Monks (Indirect Users)**

   - Being tracked for safety and coordination

**2. Temple Admins**

   - Manage operations of temple and monks

**3. Dharmshalas Admins**

   - Manage accommodation and facilities

**4. Devotees / Members**

   - Track monks

   - Participate in events and services

   - Donate and engage with temples

**5. Jain Centers Admin**

**6. Super Admin**

   - Central authority managing the entire system

 

**1.6 DESIGN PRINCIPLES**

The platform should follow:

- Simple and intuitive UI (non-technical users)

- Mobile-first design with best UI/UX

- Minimal input complexity

- Clear navigation

- Fast performance

- High reliability

- Graphical

 

**1.7 SYSTEM PRIORITIES**

The system should prioritize:

1. Safety & Security (highest priority)

2. Reliability

3. Ease of use

4. Transparency

5. Scalability

 

**1.8 SUCCESS METRICS**

The system’s success will be measured by:

- Number of monks tracked

- Number of temples onboard

- Active members

- Donations processed

- Events Participation

- Reduction in safety incidents

 

**2. PLATFORM STRUCTURE**

 

**2.1 OVERALL ARCHITECTURE**

The Jinanam system is designed as a multi-platform ecosystem consisting of:

1. Super Admin Portal

2. Admin Portal (Mobile App + Web)

3. Member Platform (Mobile App + Web)

4. Backend System (APIs, database, logic engine)

5. External Integrations (GPS Location, Google map API, WhatsApp API, Payment Gateway)

 

All platforms should be connected to a centralized backend system to ensure:

- Real-time synchronization

- Data consistency

- Scalable architecture

 

**2.2 ADMIN PORTAL (Mobile App + Web)**

**Platform Type:**

- Mobile App + Web

**Users:**

- Super Admin

- Temple Admin

- Dharmshalas Admin

- JC Admin

 

**2.2.1 PURPOSE**

**The Admin Portal will act as the control center of the entire system and will be used for:**

- Managing monks and journeys

- Managing temples and dharmshalas

- Monitoring live tracking and alerts

- Managing bookings (Rooms/Halls/Temples/Pooja etc.)

- Creating and managing events and tours

- Verifying donations and generating receipts

- Communication between temples

- Viewing reports and analytics

- Managing users, roles, and permissions

 

**2.2.2 KEY CHARACTERISTICS**

- Dashboard-driven interface

- Data-heavy screens (tables, filters, reports, graphical etc.)

- Multi-user role support

- Secure access control

- Fast navigation and minimal clicks for actions

 

**2.2.3 ACCESS CONTROL**

- Login via Mobile Number (OTP + Password option)

**Role-based access:**

- Super Admin → Full access

- Temple Admin → Limited to assigned temple (super Admin will decide)

- Dharmshalas Admin → Limited to accommodation and related modules (Super Admin will decide)

 

**2.2.4 MODULE ACCESS (HIGH LEVEL)**

**Admin Portal will include:**

- Dashboard

- Temple Management

- Temple Network

- Monk Management

- Live Tracking

- Route Planning

- Journey Logs

- Booking Management

- Event & Tour Management

- Volunteer Management

- Member Management

- Alerts & Monitoring

- Donation Management

- Communication System

- Reports & Analytics

- Settings

- Audit Logs

Each module must be accessible via sidebar navigation with menu and sub menu.

 

**2.3 MEMBER PLATFORM (MOBILE APP + WEB)**

**Platform Type:**

- Primary: Mobile App (Android & iOS)

- Secondary: Web version

**Users:**

- Devotees / Members

 

**2.3.1 PURPOSE**

The Member Platform will provide a simple and user-friendly interface for:

- Tracking monks

- Viewing temple information

- Participating in events and tours

- Booking rooms/halls/Temples

- Making donations

- Viewing announcements and feed

- Engaging with the community

 

**2.3.2 KEY CHARACTERISTICS**

- Mobile-first design

- Best UI/UX (minimal complexity)

- Fast loading

- Clear navigation

- Visual and intuitive interaction

 

**2.3.3 AUTHENTICATION**

- Login via Mobile Number

- OTP-based authentication (primary)

- Password login option

 

**2.3.4 CORE MODULES**

Member Platform will include:

- Dashboard

- Monk Tracking

- Temple Directory

- Bookings

- Events (Free + Paid)

- Tours

- Volunteers

- Feed + Polls + Offers

- Gallery

- Announcements

- Donations

- Profile & Settings

 

**2.3.5 USER EXPERIENCE GUIDELINES**

- Minimal typing required

- More selection-based input

- Clear buttons and actions

- Status visibility (booking, donation, etc.)

- Notifications for every important action

 

**2.4 BACKEND SYSTEM**

The backend system will act as the core engine connecting all platforms.

 

**2.4.1 RESPONSIBILITIES**

- Store and manage all data

- Handle APIs for mobile and web

- Process tracking data (GPS/manual)

- Manage alerts and notifications

- Handle booking and donation workflows

- Maintain audit logs

- Ensure security and access control

 

**2.4.2 DATA MANAGEMENT**

- Centralized database

- Real-time updates where required

- Data validation and consistency checks

 

**2.4.3 PERFORMANCE REQUIREMENTS**

- Fast API response time

- Ability to handle concurrent users

- Scalable architecture

 

**2.5 EXTERNAL INTEGRATIONS**

**2.5.1 GPS DEVICE INTEGRATION**

- Receive location data at defined intervals

- Store and display tracking data

 

**2.5.2 WHATSAPP API**

**Send notifications:**

- Announcements & Notice

- Bookings

- Donation receipts

 

**2.5.3 PAYMENT GATEWAY**

**Used for:**

- Paid events (creation right to Super Admin only)

- Jinanam donations

- Jain Music Festival

 

**Requirements:**

- Secure transactions

- Payment confirmation

- Integration with receipt system

 

**2.5.4 SMS**

- Backup notification system

- Used if WhatsApp fails

 

**2.6 DATA FLOW OVERVIEW**

**Example flow:**

1. Member books room → Backend stores booking → Admin Approves that booking à payment details → Member uploads proof → Admin verifies → Booking confirmed

2. Temple creates event → Backend stores → Members receive notification → Members RSVP → Data visible in admin panel

 

**2.7 SYSTEM SYNCHRONIZATION**

- All platforms must be synchronized in near real-time

- Updates from admin side should reflect instantly in member app

- Tracking updates should be reflected based on configured frequency

 

**2.8 SCALABILITY CONSIDERATION**

The system must be designed to:

- Support multiple countries, cities and regions

- Handle increasing number of temples and users

- Scale without performance degradation

 

**2.9 RELIABILITY & FAILSAFE**

- Manual journey tracking

**System should handle:**

- Device failure

- Network issues

- Data delays

 

**2.10 SECURITY**

- Role-based access control

- Secure authentication

- Data protection for users

- Restricted access to sensitive data

 

**3. USER ROLES & PERMISSIONS**

**3.1 OVERVIEW**

The Jinanam system will operate on a role-based access control (RBAC) model.

Each user will be assigned a specific role, and access to features, data, and actions will be restricted based on that role.

The system will have three primary user roles:

1. Super Admin

2. Temple/Dharmshalas/JC Admin and so on.

3. Member (Devotee)

 

**3.2 ROLE DEFINITIONS**

**3.2.1 SUPER ADMIN**

**Role Type:**

- Highest authority in the system

- Full access to all modules, data, and controls

**Responsibilities:**

- Create and manage temples and dharmshalas

- Assign admin users to temples

- Manage all monk profiles

- Monitor all journeys and tracking

- Verify and manage all donations

- Create and manage paid events

- Manage advertisements and offers

- View system-wide reports and analytics

- Manage roles and permissions

- Access and manage audit logs

- Delete users, monks, temples (only role with delete rights)

- Post announcements and push notifications

**Permissions:**

- Full Create / Read / Update / Delete (CRUD) access across all modules

- Access to all data across all temples

- Override control in case of conflicts

**Restrictions:**

None

**3.2.2 TEMPLE / DHARMSHALAS ADMIN**

**Role Type:**

- Operational user managing a specific temple or dharmshalas

**Responsibilities:**

- Manage temple/dharmshalas profile

- Create and manage events and tours

- Manage accommodation (rooms, temples and halls)

- Handle booking approvals and tracking

- Verify donations and generate receipts

- Update monk journeys (manual tracking)

- View live tracking of monks

- Communicate with other temples

- Manage volunteers

- Upload gallery content

- Post announcements and push notifications

**Permissions:**

- Create and update data related to their own temple/dharmshalas

- View monks, journeys, and relevant data

- Edit monk profiles (shared system)

- Approve/reject bookings

- Verify donations for their temple

**Restrictions:**

- Cannot access or modify data of other temples (except shared monk data)

**Cannot delete:**

- Monk profiles

- Temple/dharmshalas profiles

- Members

- Cannot create paid events

- Cannot manage advertisements

**Data Visibility:**

- Full access to their own temple data

- Limited/shared access to monk profiles

- No access to other temple financial data

 

**3.2.3 MEMBER (DEVOTEE)**

**Role Type:**

- End user of the platform (mobile + web)

**Responsibilities:**

- Track monks

- View temples and dharmshalas

- Participate in events and tours

- Book rooms and halls

- Make donations

- Engage in feed and polls

- Receive announcements and notifications

**Permissions:**

- View monks available in system

- View temple profiles and information

- RSVP to events and tours

- Book rooms/halls/pooja etc.

- Upload payment proof

- View donation receipts

- Participate in polls and community feed

**Restrictions:**

- Cannot access admin portal

- Cannot create or modify temple data

- Cannot verify donations

- Cannot approve bookings

- Cannot delete their own profile and cannot edit or delete member ID

- Cannot access/view other members’ sensitive data except name and city/state

 

**3.3 PERMISSIONS MATRIX (SUMMARY)**

Action-wise access:

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| **Module** | **Super Admin** | **Temple Admin** | **Member** |
| Create Admin | Yes | No | No |
| Edit Admin | Yes | Yes (own) | No |
| Delete Admin | Yes | No | No |
| Create Monk | Yes | Yes | No |
| Edit Monk | Yes | Yes | No |
| Delete Monk | Yes | No | No |
| Track Monks | Yes | Yes | Yes |
| Create Events | Yes | Yes | No |
| Create Paid Events | Yes | No | No |
| RSVP Events | Yes | No | Yes |
| Booking Approval | Yes | Yes | No |
| Make Booking | Yes | Yes | Yes |
| Verify Donations | Yes | Yes | No |
| Make Donation | Yes | Yes | Yes |
| Access Reports | Yes | Limited | No |
| Manage Ads | Yes | No | No |
| Manage Offers | Yes | No | No |
| Digital Counting | Yes | No | Yes |
| View Audit Logs | Yes | Limited | No |

 

**3.4 ACCOUNT CREATION RULES**

**Temple/Dharmshalas:**

- Created only by Super Admin

- Login credentials shared by Super Admin

- Cannot self-register

**Members:**

- Can self-register via mobile number (OTP)

- Profile auto-created after verification

 

**3.5 PROFILE DELETION RULES**

- Members cannot delete their own profile

- Temple admins cannot delete temple/dharmshalas profiles

- Monk profiles cannot be deleted by temple admins

**Only Super Admin can:**

- Delete members

- Delete monks

- Delete temples/dharmshalas

 

**3.6 DATA ACCESS CONTROL**

- Role-based access must be strictly enforced

- APIs must validate user role before returning data

- Sensitive data (payments, contacts) must be restricted

 

**3.7 AUDIT & ACCOUNTABILITY**

All roles must be tracked via audit logs:

- Every action should be recorded:

- User ID

- Role

- Action performed

- Timestamp

- Critical actions include:

- Donation verification

- Booking approval

- Profile updates

- Route changes

 

**3.8 SECURITY RULES**

- No unauthorized access to modules

- Session management required

- OTP-based verification for login

- Data encryption for sensitive information

 

 

 

 

 

**4. MEMBER PLATFORM (MOBILE APP + WEB)**

**4.1 OVERVIEW**

The Member Platform is designed for devotees to interact with the Jinanam ecosystem.

**It will be:**

- Mobile-first (Android & iOS)

- Simple and intuitive

- Minimal input-based

- Highly visual and easy to navigate

**The platform should allow members to:**

- Join and Track monks

- Engage with temples

- Participate in events and tours

- Book accommodation

- Make donations

- Receive notifications and updates

 

**4.2 AUTHENTICATION & ONBOARDING**

**4.2.1 PURPOSE****  
** This module manages user login, registration, and profile creation using a mobile-first approach.  
  
 **4.2.2 LOGIN OPTIONS****  
** - Mobile Number + OTP (Primary)  
 - Mobile Number + Password (Secondary)  
  
 **4.2.3 LOGIN FLOW (OTP)****  
** 1. User enters mobile number  
 2. System sends OTP  
 3. User enters OTP  
 4. System verifies OTP  
 5. If valid:  
 - Login successful  
  
 **4.2.4 LOGIN FLOW (PASSWORD)****  
** 1. User enters mobile number + password  
 2. System validates credentials  
 3. Login successful  
  
 **4.2.5 FIRST-TIME USER FLOW****  
** - After OTP verification:  
 - Redirect to profile creation  
  
 **4.2.6 PROFILE CREATION FIELDS (Below is sample, Complete details in another word file)****  
** - Full Name (mandatory)  
 - Mobile Number (auto-filled)

- WhatsApp Number

- Country (mandatory)  
 - City (mandatory)  
 - State (mandatory)

- Area – Malad E, Malad W etc.  
 - Community  
  
  

- Each member must be assigned a unique Member ID at the time of account creation.  
  **This Member ID should be:****  
** - System-generated  
 - Unique across the platform  
 - Non-editable by the user  
  
 **Member ID should be used for:****  
** - Internal member tracking/profile view by admin and super admin  
 - Booking records  
 - Donation records  
 - Audit logs  
  
 Member should be able to view their Member ID in profile section.  
  
 **4.2.7 FAMILY MEMBER ADDITION**

User can add multiple family members:  
 - Name  
 - Mobile Number  
  
 **Flow:****  
** - Upon submission:  
 - SMS/WhatsApp sent:  
 "Your profile has been created by [Name]. Download the app to continue."  
  
 **4.2.8 PROFILE RULES****  
** - Members can edit profile  
 - Members cannot delete profile  
 - Only Super Admin can delete  
  
  

**4.2.9 VALIDATION RULES****  
** - Mobile number must be unique  
 - OTP expiry: 2–5 minutes  
 - Limit OTP retries  
  
 **4.2.10 SESSION MANAGEMENT****  
** - User remains logged in unless:  
 - Logout manually  
  
 **4.2.11 SECURITY****  
** - OTP must be encrypted  
 - Rate limit OTP requests  
 - API must validate mobile number format  
  
 **4.2.12 EDGE CASES****  
** - Invalid OTP → show error  
 - OTP expired → allow resend  
 - Duplicate number → login instead of register

 

**4.3 DASHBOARD (HOME SCREEN)**

**4.3.1 PURPOSE****  
** Provide a centralized overview of important updates, alerts, and quick access to key features.  
  
 **4.3.2 COMPONENT STRUCTURE****  
** Dashboard should be divided into the following sections:

**1. Monk Tracking Section****  
** - Monk Name  
 - Status (Moving / Idle / Offline)  
 - Current Location  
 - Last Updated Time  
 **Action:****  
** - Click → open tracking details  
  
 **3. Upcoming Events****  
** - Event Name  
 - Date & Time  
 - Temple  
 **Action:****  
** - RSVP button

**4. Announcements****  
** - Latest updates from temples  
  
 **5. Feed Preview****  
** - Latest posts

 

**6 Show "Today's Tithi"****  
****  
** **4.3.3 PRIORITY LOGIC****  
** **Display order:****  
** 1. Alerts  
 2. Monk Tracking  
 3. Events  
 4. Announcements  
 5. Feed

  
 **4.3.4 PERSONALIZATION****  
** Data shown based on:  
 - Linked temples  
 - Active monks  
  
 **4.3.5 INTERACTION****  
** - Each section is clickable  
 - Redirect to respective module  
  
  

**4.3.6 ACTION BEHAVIOR****  
** - Monk card → Tracking screen  
 - Event card → Event details  
 - Announcement → Full view  
 - Feed → Feed page

- Offers → Offers page  
  
 **4.3.7 EDGE CASES****  
** - No data → show placeholders:  
 - "No events available"  
 - "No monks available"

 

**4.4 MONK TRACKING MODULE**

**4.4.1 PURPOSE****  
** Enable members to track monks in real-time via manual journey updates.  
  
 **4.4.2 VIEW TYPES****  
** 1. Map View  
 2. List View  
  
 **4.4.3 MAP VIEW FEATURES****  
** - Display monk markers  
 - Status colors:  
 - Green → Moving  
 - Yellow → Idle  
 - Red → Offline  
  
 **4.4.4 MONK DETAILS (ON CLICK)****  
** - Monk Name  
 - Current Location  
 - Status  
 - Last Updated Time

- Route (if available)  
  
 **4.4.5 LIST VIEW****  
** - Monk Name  
 - Status  
 - Location  
  
 **4.4.6 JOIN MONK FEATURE****  
** - If monk is within defined radius:  
 - Notify user  
 - User can choose to join  
 **Rules:****  
** - Visibility of joined users is optional  
 - Contact details shared only with consent  
  
 **4.4.7 FILTERS****  
** - By Temple  
 - By Status (Moving / Idle / Offline)  
 - By Community  
  
 **4.4.8 DATA SOURCE****  
** - Manual journey updates  
  
 **4.4.9 REFRESH LOGIC****  
** - Auto refresh based on tracking interval  
 - Manual refresh option for user  
  
 **4.4.10 RULES****  
** - Show last known location if offline  
 - Always display latest available data  
  
 **4.4.11 PRIVACY RULES****  
** - Member identity visibility should be optional  
 - Personal contact details must not be exposed without consent  
  
 **4.4.12 EDGE CASES****  
** - Device offline → show last known location  
 - Incorrect data → allow admin correction (logged)

 

**4.5 TEMPLE DIRECTORY & PROFILE**

**4.5.1 PURPOSE****  
** This module allows members to explore temples and dharmshalas, view complete information, and stay connected with their activities.  
  
 **4.5.2 TEMPLE LISTING****  
** - Display list of temples  
 - Search and filter by:  
 - City  
 - State  
  
 **4.5.3 TEMPLE PROFILE DETAILS (complete details in another word file)****  
** Each temple profile should include:  
 - Temple Name  
 - Location (Map view)  
 - Address  
 - Contact Details  
 - Pooja Timings  
 - Dhaja Information:  
 - Last Dhaja By (link member)  
 - Next Dhaja By (link member)  
 - Dhaja Date  
 - Temple Biography / History  
 - Bank / UPI Details (for donation)  
 - Gallery (images/videos links)  
 - Upcoming Events  
 - Tours  
  
 **4.5.4 MEMBER INTERACTIONS****  
** Members can:  
 - View full temple details  
 - Donate to temple  
 - View events and tours  
 - Access gallery  
 - Link temple to their profile  
  
 **4.5.5 RULES****  
** - Temple profiles are created only by Super Admin  
 - Temple admins can edit details  
 - Temple profile cannot be deleted by temple admin  
 - Only Super Admin can delete permanently  
  
 **4.5.6 EDGE CASES****  
** - Inactive temple → marked inactive  
 - Missing details → show placeholders

 

**4.6 DHARMSHALAS & BOOKING**

**4.6.1 PURPOSE****  
** This module allows members to book rooms and halls in dharmshalas with a structured approval and payment verification system.  
  
 **4.6.2 BOOKING TYPES (Let admin decide what to create)****  
** - Room Booking  
 - Hall Booking

- Temple Booking

- Pooja Booking  
  
 **4.6.3 BOOKING FLOW (MEMBER)****  
** 1. Select Temple/Dharamshala  
 2. View available rooms/halls  
 3. Select option  
 4. View:  
 - Price  
 - Capacity  
 - Rules  
 5. Submit booking request  
 6. System displays payment details  
 7. Member uploads payment proof  
 8. Booking status set to "Payment Pending"  
 9. Admin verifies payment  
 10. Booking confirmed  
  
 **4.6.4 BOOKING STATUS****  
** - Pending  
 - Payment Pending  
 - Confirmed  
 - Cancelled  
  
 **4.6.5 RULES****  
** - Payment must be completed within 1 hour  
 **If not:****  
** - Booking auto-cancelled  
 - Slot becomes available again  
 - Prevent double booking  
 - Booking ID must be generated for each booking  
  
 **4.6.6 MEMBER FEATURES****  
** - View booking history  
 - Track booking status  
 - Receive notifications:  
 - Booking submitted  
 - Booking confirmed  
 - Booking cancelled  
  
 **4.6.7 VALIDATION****  
** - Check availability before booking  
 - Prevent duplicate booking requests  
  
 **4.6.8 EDGE CASES****  
** - Payment uploaded but not verified → show "Pending"  
 - Booking expired → auto cancel  
 - Invalid payment proof → reject

 

**4.7 EVENTS MODULE**

**4.7.1 PURPOSE****  
** This module allows Admins to create events and members to view, filter, and participate in them.  
  
 **4.7.2 EVENT TYPES****  
** **1. Temple-Specific Events****  
** - Visible only to linked members  
  
 **2. Public Events****  
** - Visible to all members  
  
 **4.7.3 EVENT CREATION (ADMIN)****  
** **Fields:****  
** - Event Title  
 - Description  
 - Date & Time  
 - Temple  
 - Location  
 - Event Type (Temple/Public)  
 - Capacity (optional)  
 - Instructions (optional)  
  
 **4.7.4 MEMBER FLOW****  
** 1. Member opens Events section  
 2. Applies filters:  
 - City  
 - Date  
 - Temple  
 3. Views event list  
 4. Selects event  
 5. Views details  
 6. Clicks RSVP  
  
 **4.7.5 RSVP SYSTEM****  
** Member registers for event  
 Status:  
 - Registered  
 - Cancelled

- Approved  
  
 **4.7.6 CAPACITY CONTROL****  
** - Admin defines maximum capacity  
 Once full:  
 - Disable RSVP  
 - Show Waitlist  
  
 **4.7.7 MEMBER FEATURES****  
** - View upcoming events  
 - RSVP  
 - Share events on social media with APP link, so if anyone wants to view the event, they have to download the app.  
  
  

**4.7.8 NOTIFICATIONS****  
** - Event created → notify members  
 - 12hrs Reminder before event (applies to all free events)

- 12hrs and 3hrs Reminder before event (applies to all paid events)  
  
 **4.7.9 EDGE CASES****  
** - Event cancelled → notify all participants  
 - Capacity full → disable RSVP  
 - No events → show placeholder

 

**4.8 PAID EVENTS**

4.8.1 PURPOSE  
 This module allows the Jinanam platform (Super Admin only) to create and manage paid events, where members can book tickets through the app and gain entry using a QR-based system.  
 This is a controlled feature and will not be available to temples.  
  
 **4.8.2 ACCESS CONTROL****  
** - Only Super Admin can:  
 - Create paid events  
 - Manage pricing  
 - View bookings  
 - Temple admins cannot create or manage paid events  
  
 **4.8.3 EVENT CREATION (SUPER ADMIN)****  
** Fields:  
 - Event Title  
 - Description  
 - Date & Time  
 - Location  
 - Event Banner/Image  
 - Ticket Price  
 - Total Capacity  
 - Instructions (optional)  
 - Terms & Conditions (optional)  
  
 **4.8.4 MEMBER FLOW****  
** 1. Member opens Events section  
 2. Views paid events (clearly marked)  
 3. Selects event  
 4. Views details:  
 - Price  
 - Date & Time  
 - Location  
 - Available slots  
 5. Clicks "Book Now"  
 6. Proceeds to payment (via payment gateway)  
 7. Payment successful  
 8. Ticket generated  
 9. QR code displayed  
  
 **4.8.5 PAYMENT SYSTEM****  
** - Integrated payment gateway required  
 - Real-time payment confirmation  
 - Payment failure → show error and allow retry  
  
 **4.8.6 TICKET GENERATION****  
** - Unique ticket generated per booking  
 - QR code generated for each ticket  
  
 **4.8.7 QR CODE RULES****  
** - Each QR code must be:  
 - Unique  
 - Non-reusable  
 - Used for event entry verification  
  
 **4.8.8 ENTRY SYSTEM****  
** - QR code scanned at event entry  
 - System validates ticket:  
 - Valid → Allow entry  
 - Invalid / Used → Deny entry  
  
 **4.8.9 MEMBER FEATURES****  
** - View booked events  
 - Access QR code anytime  
 - View ticket details  
  
 **4.8.10 ADMIN FEATURES****  
** - View list of bookings  
 - View participant details  
 - Track total revenue  
 - Download reports  
  
 **4.8.11 CAPACITY CONTROL****  
** - Once capacity is reached:  
 - Disable booking  
  
 **4.8.12 NOTIFICATIONS****  
** - Booking confirmation  
 - Payment confirmation  
 - Event reminder  
  
 **4.8.13 EDGE CASES****  
** - Payment success but ticket not generated:  
 → System must auto-reconcile and generate ticket  
  
 - Duplicate booking attempts:  
 → Allow only if multiple tickets permitted (optional)  
  
 - QR already used:  
 → Block entry  
  
 - Event cancelled:  
 → Notify users  
 → Refund logic (if applicable)

 

**4.9 TOURS**

**4.9.1 PURPOSE****  
** This module allows temples to organize spiritual tours and enables members to participate.  
  
 **4.9.2 TOUR CREATION (ADMIN)****  
** **Fields:****  
** - Tour Title  
 - Description  
 - Start Location  
 - Destination(s)  
 - Route (multi-stop)  
 - Start Date & Time  
 - End Date & Time  
 - Organizer (Temple/Dharamshala/JC Selection if creating on behalf of some others)  
 - Contact Details  
 - Capacity (max participants)  
 - Rules / Instructions / Payment Details

- Website Links, Google Form Links, Whatsapp group links & option to add multiple links.  
  

  
 **4.9.3 MEMBER FLOW****  
** 1. View tours  
 2. Select tour  
 3. View details (route, date, slots)  
 4. Click RSVP  
 5. Status shown:  
 - Confirmed / Waiting / Cancelled  
  
 **4.9.4 RULES****  
** - Stop RSVP when capacity full  
 - Optional waitlist  
 - Members can cancel their RSVP, and waitlist gets confirmation  
  
 **4.9.5 NOTIFICATIONS****  
** - Tour created  
 - Reminder before start and reminder at the end of tour registration date  
 - Updates  
  
 **4.9.6 EDGE CASES****  
** - Tour cancelled → notify all  
 - Capacity full → disable RSVP and start waitlist.

- Show the RSVP and waitlist to temple admin

 

**4.10 VOLUNTEERS**

**4.10.1 PURPOSE****  
** This module allows temples to request volunteers and enables members to participate in seva activities.  
  
 **4.10.2 VOLUNTEER CREATION (ADMIN)****  
** **Fields:****  
** - Event Name  
 - Role Title  
 - Description of work  
 - Number of volunteers required  
 - Date & Time  
 - Location (Temple/Dharamshala)  
 - Instructions  
 - Contact Person  
  
 **4.10.3 MEMBER FLOW****  
** 1. Member opens Volunteers section  
 2. Views available opportunities  
 3. Selects a role  
 4. Views details  
 5. Clicks "Apply"  
  
 **Status:****  
** - Applied  
 - Approved  
 - Rejected  
  
 **4.10.4 ADMIN FLOW****  
** - View applicants  
 - Approve / Reject  
 - Assign roles (optional)  
  
 **4.10.5 RULES****  
** - Stop applications when required count is reached  
 - Prevent duplicate applications  
 - Admin can override capacity (optional)  
  
  
 **4.10.6 NOTIFICATIONS****  
** - New opportunity → notify members  
 - Approval → notify member  
 - Reminder → notify volunteers  
  
 **4.10.7 EDGE CASES****  
** - Volunteer cancels → reopen slot  
 - Event cancelled → notify all volunteers

 

**4.11 FEED + POLLS + OFFERS**

**4.11.1 PURPOSE****  
** This module acts as a community engagement platform where members can view updates, participate in polls, and see sponsored content.  
  
 **4.11.2 FEED CONTENT TYPES****  
** Feed will include:  
  
 **1. Temple Updates****  
** - Events  
 - Announcements  
 - Activities  
  
 **2. Monk Updates****  
** - Journey updates  
 - Arrival notifications  
  
 **3. System Updates****  
** - Alerts  
 - Important notifications  
  
 **4. Sponsored Content (Ads)****  
****  
** **4.11.3 FEED STRUCTURE****  
** Each feed card should include:  
 - Title  
 - Description  
 - Image/Video (optional)  
 - Posted by (Temple/System)  
 - Timestamp  
 - Action button (optional):  
 - RSVP  
 - View Details  
 - Donate  
  
 **4.11.4 POLLS****  
** **Purpose:****  
** - Engage members in decision-making or feedback  
  
 **Features:****  
** - Single choice poll  
 - Multiple choice poll (optional)  
 - View results after voting  
  
 **Fields:****  
** - Question  
 - Options (2 or more)  
 - Expiry date (optional)  
  
 **Rules:****  
** - One vote per user  
 - Cannot change vote after submission  
  
  
  

**4.11.5 ADVERTISEMENT**

**4.11.5.1 PURPOSE**

This module enables sponsored advertising within the app to generate revenue while maintaining a clean and non-intrusive user experience.

 

**4.11.5.2 AD PLACEMENT (FEED)**

1. Top Feed Banner (Primary Ad Slot)

- Display 1 advertisement banner at the top/center of feed when user opens the app

- Format:

   - Image slider (carousel)

   - Total 3 images per ad slot

- Each image should support:

   - Separate hyperlink (click action)

   - Redirect to external/internal link

 

2. In-Feed Ads (After Every 3 Posts)

- After every 3 feed posts:

   - Show 1 advertisement card

- Each ad card:

   - Same format as above (3-image slider)

   - Each image has its own clickable link

 

3. Total Ad Slots

- Maximum 5 ad placements per feed session

- Each slot contains:

   - 3 image slider (carousel format)

 

**4.11.5.3 AD STRUCTURE**

Each advertisement must include:

- 1 to 3 images (slider)

- Title (optional)

- Description (optional)

- Clickable link per image

- Company/Brand name (optional)

- Contact details (optional)

 

**4.11.5.4 DISPLAY RULES**

- Ads should:

   - Blend naturally with feed UI

   - Not disrupt user experience

 

**4.11.5.5 OFFERS PAGE (DEDICATED AD MODULE)**

- Separate "Offers" page in app

Each offer should include:

- Image/banner

- Offer description

- Company name

- Contact number

- Website / external link

- Terms & conditions

 

**4.11.5.6 OFFER SCHEDULING**

Super Admin can define:

- Start Date:

   - Offer becomes visible from this date

- End Date:

   - Offer is removed automatically from active list

   - Moved to "Expired Offers" section (Admin + Member)

 

**4.11.5.7 OFFER DISPLAY**

- Display as card-based layout

- Each card contains:

   - Image

   - Description

   - CTA button (Visit / Contact / Redeem)

 

**4.11.5.8 ADMIN CONTROL**

- Only Super Admin can:

   - Create ads

   - Edit ads

   - Schedule ads

   - Remove ads

- Push Notifications send options with selections like city, state country etc. to be given to super admin for each ad. While creating the ad the super admin should have 2 options: 1-Select all, 2-Specific to city, state, country and if selected specific then only the members registered to that city, state, country should view the add in their app.

**- Temples cannot manage advertisements**

 

**4.11.5.9 TRACKING & ANALYTICS (IMPORTANT)**

System should track:

- Number of views (impressions)

- Number of clicks

- Click-through rate (CTR)

 

**4.11.5.10 RULES**

- Expired offers must not be shown in active list to Super admin and members

 

**4.11.5.11 EDGE CASES**

- Broken link → show fallback message or ignore click

- No active ads → hide ad slots

- Expired offer → auto move to expired section

- Ad posted → Send push notification to the members

- Ad Expiry → Send push notification to the members before 12hrs of the expiry  
  
 **4.11.6 FEED PERSONALIZATION****  
** - Members should see:  
 - Content from linked temples (primary + secondary)  
 - General system content  
  
 **4.11.7 INTERACTION (OPTIONAL FUTURE)****  
** - Like  
 - Share  
 - Comment (optional, Phase 2)  
  
 **4.11.8 NOTIFICATIONS****  
** - New post → notify members  
 - Important updates → push notification  
  
 **4.11.9 EDGE CASES****  
** - Expired poll → disable voting  
 - Deleted post → remove from feed  
 - Ad expiry → auto remove

 

**4.12 OFFERS PAGE** **– Refer 4.11.5 (****ADVERTISEMENT****)****  
****  
  
**

**4.13 GALLERY**

**4.13.1 PURPOSE****  
** This module allows temples and dharmshalas to upload and showcase images and videos of events, activities, and facilities.  
  
 **4.13.2 CONTENT TYPES****  
** Gallery should support:  
 - Images  
 - Video links (YouTube or external)  
  
 **4.13.3 STRUCTURE****  
** Gallery should be organized in:  
 1. Event-wise Gallery  
 - Each event has its own media collection and folder name with date and location  
 2. General Gallery  
 - Temple/dharamshala-level uploads  
  
 **4.13.4 MEDIA CARD STRUCTURE****  
** Each item should include:  
 - Thumbnail  
 - Title  
 - Event name, date and time  
 - Upload date  
 - Media type (image/video link)  
  
 **4.13.5 FEATURES****  
** - Grid view display  
 - Click to open full view  
 - Video preview (for YouTube links)  
 - Swipe/scroll navigation  
  
 **4.13.6 ADMIN FLOW****  
** - Upload images/videos link  
 - Add media to:  
 - Specific folder, event OR  
 - General gallery  
 - Add title, event date, location, time & description  
  
 **4.13.7 RULES****  
** - Support multiple uploads each event can have 50images and 25 video link options only  
 - Maintain media quality optimization  
  
 **4.13.8 EDGE CASES****  
** - Broken video link → show fallback message  
 - No delete options to admin, they can raise the ticket to super admin for event delete.

 

**4.14 ANNOUNCEMENTS**

**4.14.1 PURPOSE****  
** This module allows temples and system admins to broadcast important updates to members.  
  
 **4.14.2 TYPES****  
** - Temple-specific announcements  
 - System-wide (to all members) announcements  
  
 **4.14.3 STRUCTURE****  
** Each announcement should include:  
 - Title  
 - Description  
 - Posted by (Which Temple/Dharamshala/Jinanam System)  
 - Date & Time  
 - Attachments if any  
  
 **4.14.4 TARGETING****  
** - Temple announcements: They should have below two option before submitting  
 → Visible to linked members  
 → Visible to all members

  
 - System announcements: Two options  
 → Visible to all members  
 → Visible to Specific group filtered by city, state, country, pincode. Etc.

  
 **4.14.5 MEMBER FLOW****  
** - View announcements  
 - Click to read full details  
  
 **4.14.6 NOTIFICATIONS****  
** - Push notification on new announcement  
 - Important announcements marked priority  
  
 **4.14.7 RULES****  
** - Editable by admin  
 - Historical announcements remain visible  
  
 **4.14.8 EDGE CASES****  
** - Deleted announcement → removed  
 - Expired → optional auto-hide

 

**4.15 MEMBER LINKING**

**4.15.1 PURPOSE****  
** This module allows members to connect with temples/dharmshalas to receive personalized updates and notifications.  
  
 **4.15.2 LINKING STRUCTURE**

**Temple/Dharamshala****  
** Each member must select:  
 - In their profile there should always be one Temple linked by default i.e. Jain Music Fest. (Create this if you want and give admin access like temple and this should be Linked to all the members by default. Apart from this follow below.

- For members, 1 mandatory temple they must select, 2 optional Primary Temples/Dharmshalas  
 - And up to 6 Secondary Temples/Dharmshalas

**Monks**

Each member must select:  
 - 1 Primary monk they believe and 9 secondaries.

So, the route update, travelling notifications to be sent to those linked members only.

E.g. If the member is linked with ABC Monk, then the updates via app notifications (valid for 24hrs) of ABC monk should be sent to that member only.

Another E.g. If 250 members are registered and out of that only 100 members are linked with ABC monk, then the updates related ABC monk to be sent to 100members via app notification.

  
 **4.15.3 ONBOARDING FLOW****  
** 1. After registration, user is prompted to select temples (1 should be by default and 1 should be mandatory, and 8 optional)  
 2. User selects:

- Default  
 - Primary  
 - Secondary  
 3. Data is saved to user profile  
  
 **4.15.4 FEATURES****  
** - Personalized feed based on linked temples  
 - Receive announcements from linked temples on priority  
 - Receive event updates from linked temples/dharmshalas  
 - Receive monk journey alerts  
  
 **4.15.5 RULES****  
** - Minimum 1 primary selections required for Temple and monk  
 - Members can update linking anytime through their settings  
 - No duplication allowed  
  
 **4.15.6 DATA USAGE****  
** Linked temples will be used for:  
 - Feed personalization  
 - Notification targeting  
 - Event recommendations  
  
 **4.15.7 EDGE CASES****  
** - Temple becomes inactive → remove from linking  
 - Member removes temple → stop notifications

 

**4.16 DONATIONS**

**4.16.1 PURPOSE****  
** This module enables members to make donations to temples/dharmshalas and to the Jinanam platform, ensuring transparency and proper verification.  
  
 **4.16.2 TYPES OF DONATIONS****  
** 1. Temple/Dharamshala Donation (Manual)  
 2. Jinanam Platform Donation (Online via Payment Gateway)

3. Jain Music Festival Donation (Online via Payment Gateway)  
  
 **4.16.3 TEMPLE DONATION FLOW (MANUAL)****  
** 1. Member selects temple  
 2. Views bank/UPI details  
 3. Makes payment externally  
 4. Enters transaction reference number and amount  
 5. Uploads payment proof (screenshot)

6. Select Categories (Multiple option) – like General, Gau Seva, and so on (these categories will create/edit by individual temple/Dharamshala only) – Totals amount.

Once the categories are created and receipts are generated in those categories then it will not be edited/deleted. Only super admin will have that right to edit and delete. If any category was created but receipts under thode category is not generated, then admin can edit/delete those.

7. Total Amount should match with entered amount.  
 8. Submission created with status: "Pending"  
 9. Admin verifies:  
 - Mark as Verified / Rejected  
 10. Auto Receipt generated (on verification)  
  
 **4.16.4 COUNTER DONATION (ADMIN ENTRY)****  
** - Temple admin can:  
 - Enter offline donation received at temple  
 - Fill donor details  
 - Generate receipt  
 - Receipt becomes visible in member app (if linked)  
  
 **4.16.5 Jinanam DONATION (ONLINE)****  
** 1. At Top/start Display message (Message will be created by Super Admin and change right to be given to the Super admin)

2. Member enters amount  
 3. Payment via payment gateway  
 4. Payment success → auto confirmation  
 5. Receipt generated instantly

 

**JAIN MUSIC FESTIVAL (ONLINE)****  
** 1. At Top/start Display message (Message will be created by Super Admin and change right to be given to the Super admin)

2. Member enters amount  
 3. Payment via payment gateway  
 4. Payment success → auto confirmation  
 5. Receipt generated instantly

(Short note in the receipt that at the end of the FY they will get the 10BE certificate of 80g benefit over an email provided)

  
 **4.16.6 RECEIPT STRUCTURE****  
** Each receipt must include:  
 - Temple/Dharamshala name  
 - Registration number  
 - Member number and Name  
 - Amount  
 - Date  
 - Authorized signatory  
 - Stamp  
 - 80G eligibility (Yes/No)  
  
 **4.16.7 MEMBER FEATURES****  
** - View donation history  
 - Download receipts anytime  
 - Track donation status  
  
 **4.16.8 VALIDATION RULES****  
** Prevent duplicate submission using same:  
 - Screenshot  
 - Transaction reference  
 - Mandatory fields must be filled  
  
 **4.16.9 PAYMENT RECONCILIATION****  
** - Admin should:  
 - Match payment proof with transaction details  
 **Maintain logs of:****  
** - Verified  
 - Rejected  
 - All actions logged in audit system  
  
 **4.16.10 EDGE CASES****  
** - Invalid screenshot → reject  
 - Payment uploaded but not verified → show "Pending"  
 - Duplicate submission → block or flag

 

**4.17 NOTIFICATIONS**

**4.17.1 PURPOSE**

To ensure timely communication and updates to users across all critical actions in the system.

 

**4.17.2 NOTIFICATION CHANNELS**

- In-App Notifications

- Push Notifications

- WhatsApp Notifications

- SMS (fallback)

 

**4.17.3 NOTIFICATION TYPES**

**1. System Notifications**

- Alerts

- Updates

**2. Transaction Notifications**

- Booking confirmation

- Donation verification

**3. Event Notifications**

- Event created

- Event reminder

**4. Journey Notifications**

- Monk nearby

- Arrival alerts

**5. Announcement Notifications**

- Permanent announcements

- Push-only temporary announcements (24-hour visibility)

 

**4.17.4 TRIGGERS**

- Booking confirmed

- Booking cancelled

- Donation verified

- Event created

- Announcement posted

- Monk arrival (24hr & 2hr)

- SOS alert

- Daily Tithi notification (morning)

- Daily Count 3 Navkar notification (morning)

 

**4.17.5 PRIORITY LEVELS**

**High Priority:**

  - SOS alerts

  - Critical system alerts

**Medium:**

  - Booking updates

  - Donations

  - Announcements

**Low:**

  - Feed updates

  - Offers

 

**4.17.6 DELIVERY RULES**

**Notifications must:**

  - Be sent instantly for critical events

  - Be batched for low priority (optional)

  - Avoid duplicate notifications

**Push notifications should:**

  - Be delivered reliably

  - Open relevant screen on click

 

**4.17.7 PUSH-ONLY TEMPORARY NOTIFICATIONS (24-HOUR)**

Admin can send push-only notifications that:

  - Visible only in notification section

  **Are NOT stored in:**

  - Feed

  - Announcement list

**Validity:**

  - Automatically expire after 24 hours

  - Removed from UI after expiry

**Fields:**

  - Title

  - Message

  - Priority (optional)

 

**4.17.8 USER CONTROL**

**User can:**

  - Enable/disable certain notifications

  - Set preferences

 

**4.17.9 EDGE CASES**

- Notification failure → retry or fallback

- WhatsApp failure → use SMS (optional)

- Duplicate trigger → prevent duplicate notification

- Expired push notification → auto remove from UI

 

**4.18 SEARCH & FILTER**

**4.18.1 PURPOSE****  
** To allow users to quickly find relevant data across the platform.  
  
 **4.18.2 SEARCH FUNCTIONALITY****  
** Search should support:  
  
 - Monks (by name)  
 - Temples (by name, city)  
 - Events (by title)  
 - Tours (by name/location)  
  
 **4.18.3 FILTER OPTIONS****  
** **Events:****  
** - City  
 - Date  
 - Temple  
  
 **Temples:****  
** - City  
 - Facilities (optional future)  
  
 **Monks:****  
** - Status (Moving / Idle / Offline)  
  
 **Donations:****  
** - Date  
 - Temple  
 - Status  
  
 **Bookings:****  
** - Date  
 - Temple  
 - Status  
  
 **4.18.4 USER EXPERIENCE****  
** - Search bar at top  
 - Instant results (auto-suggest optional)  
 - Filters accessible via dropdown or panel  
  
 **4.18.5 RULES****  
** - Search should return relevant results  
 - Filters should be combinable (e.g., City + Date)  
  
 **4.18.6 EDGE CASES****  
** - No results → show "No data found"  
 - Invalid search → show suggestions

 

**4.19 MANUAL ROUTE SYSTEM**

**4.19.1 PURPOSE****  
** This module provides a fallback tracking system where temple admins can manually update the journey of monks when GPS tracking is unavailable or not used.  
  
 **4.19.2 JOURNEY CREATION (ADMIN FLOW)****  
** Temple Admin creates a journey with:  
 - Monk Name  
 - Start Temple  
 - Next Temple (Destination)  
 - Full Route (A → B → C → D)  
 - Journey Start Date & Time  
 - Expected Arrival Date & Time  
 - Notes (optional)  
  
 **4.19.3 SYSTEM BEHAVIOR****  
** - Once journey is created:  
 - Notify destination temple  
 - Notify all upcoming temples in route  
 - Display journey in admin dashboard  
 - Display in member app  
  
 **4.19.4 JOURNEY PROGRESSION****  
** **At each step:****  
** - Temple Admin updates status:  
 - Arrived  
 - Delayed  
 - Proceeded  
 - System updates:  
 - Timeline  
 - Logs  
 - Notifications  
  
 **4.19.5 MEMBER EXPERIENCE****  
** **Members can:****  
** - View journey route  
 - View expected arrival  
 - Track current stage  
  
 **4.19.6 ARRIVAL NOTIFICATIONS****  
** Members linked with destination temple should receive:  
 - Notification 24 hours before arrival  
 - Notification 2 hours before arrival

  
  
 **4.19.7 RULES****  
** - Manual tracking must update journey logs  
 - Works independently or alongside GPS tracking  
 - Status updates are mandatory at each step  
  
 **4.19.8 EDGE CASES****  
** - Delay update → notify next temple  
 - Journey cancelled → notify all stakeholders  
 - Incorrect update → allow admin correction (logged)

 

**4.20 ERROR HANDLING**

**4.20.1 PURPOSE****  
** Ensure the system handles failures gracefully and provides clear feedback to users.  
  
 **4.20.2 GENERAL PRINCIPLES****  
** - Errors must be:  
 - Clear  
 - User-friendly  
 - Actionable  
  
 **4.20.3 COMMON ERROR SCENARIOS****  
** **1. Booking Errors:****  
** - Room not available  
 - Payment timeout  
 - Duplicate booking  
  
 **2. Payment Errors:****  
** - Payment failed  
 - Invalid screenshot upload  
  
 **3. Network Errors:****  
** - No internet connection  
 - API failure  
  
 **4. Authentication Errors:****  
** - Invalid OTP  
 - Session expired  
  
 **4.20.4 SYSTEM RESPONSE****  
** - Show clear error message  
 - Provide retry option where applicable  
 - Prevent system crash  
  
 **4.20.5 EXAMPLES****  
** - "Payment not received. Please try again."  
 - "Room already booked. Please select another option."  
 - "Network error. Please check your connection."  
  
 **4.20.6 LOGGING****  
** - All errors should be logged in backend  
 - Critical errors should be visible to admin  
  
 **4.20.7 EDGE CASES****  
** - Partial failures (e.g., payment success but no confirmation)  
 → System should reconcile and notify admin

 

**4.21 PERFORMANCE REQUIREMENTS**

**4.21.1 PURPOSE****  
** Ensure the application delivers a smooth, fast, and reliable experience for all users.  
  
 **4.21.2 PERFORMANCE REQUIREMENTS****  
** - Screen load time:  
 - \< 3 seconds for most screens  
 - API response time:  
 - \< 2 seconds  
 - Tracking updates:  
 - Reflect based on configured interval

  
 **4.21.3 UI/UX EXPECTATIONS****  
** - Clean and minimal design  
 - Easy navigation  
 - Clear buttons and actions  
 - Minimal typing (more selection-based inputs)  
  
 **4.21.4 RESPONSIVENESS****  
** - Mobile-first design  
 - Works across:  
 - Android  
 - iOS  
 - Web browsers  
  
 **4.21.5 FEEDBACK SYSTEM****  
** - Show loading indicators for actions  
 - Show confirmation messages:  
 - Booking successful  
 - Donation submitted  
  
 **4.21.6 ERROR EXPERIENCE****  
** - Errors should not block entire app  
 - Allow retry wherever possible  
  
 **4.21.7 SCALABILITY IN UX****  
** - UI should support:  
 - Large number of temples  
 - Large data lists (pagination required)  
  
 **4.21.8 EDGE CASES****  
** - Slow network → show loading state  
 - Large data → use pagination or lazy loading

 

**4.21 TITHI CALENDAR (SPIRITUAL CALENDAR)**

**4.21.1 PURPOSE**

This module provides a structured spiritual calendar system where daily Jain tithi information (such as Poonam, Amavasya, etc.) is managed centrally by Super Admin and displayed to Temple Admins and Members based on their selected calendar preference.

 

**4.21.2 CALENDAR TYPES (SUPER ADMIN SETUP)**

Super Admin will create and manage multiple calendar types such as:

- Gujarati Calendar

- Kutchi Calendar

- Marwari Calendar

- Hindi Calendar

- Others

Each calendar will be independent and configurable.

 

**4.21.3 CALENDAR DATA MANAGEMENT (SUPER ADMIN)**

For each calendar type, Super Admin will:

- Add entries for all 365 days (year-wise)

- Define for each date:

   - Gregorian Date (e.g., 1 April 2026)

   - Tithi Name (e.g., Poonam, Amavasya)

   - Description

Edit or update entries if required

 

**4.21.4 TEMPLE ADMIN EXPERIENCE**

- Temple Admin will have access to Tithi Calendar in their portal by default

- Calendar displayed based on system default or selected type

 

**4.21.5 TEMPLE ADMIN NOTIFICATIONS**

- Temple Admin should receive:

   - Daily notification in the morning

   - Example:

  "Today is Poonam" and short description/message.

 

**4.21.6 CORRECTION / TICKET SYSTEM**

If Temple Admin finds incorrect calendar data:

- They can raise a correction request (ticket)

 

Ticket should include:

- Date

- Calendar type

- Issue description

 

**4.21.7 SUPER ADMIN TICKET MANAGEMENT**

Super Admin can:

- View all tickets

- Take action:

- Approve correction

- Reject request

- Update calendar data if required

- Close ticket after resolution

 

**4.21.8 MEMBER CALENDAR SELECTION**

During profile creation:

- Member must select preferred calendar:

- Gujarati / Kutchi / Marwari / etc.

 

This selection will define:

   - Calendar view

   - Notification content

**4.21.9 MEMBER EXPERIENCE**

Members should be able to:

- View calendar in app menu

See:

- Today's Tithi

- Monthly calendar view

- Default calendar = selected preference

- Option to view other calendar types (optional)

 

**4.21.10 MEMBER NOTIFICATIONS**

Members receive daily notification:

- Based on selected calendar

- Example: "Today is Poonam" and short description/msg if any

 

**4.21.11 SETTINGS (CHANGE CALENDAR)**

- Member can change calendar type in settings

- After change:

   - Future notifications follow new selection

   - Calendar view updates accordingly

 

**4.21.12 DASHBOARD INTEGRATION**

- Display "Today's Tithi" on dashboard

Example:

   "Today: Poonam"

 

**4.21.13 RULES**

- Tithi must be shown based on:

   - User-selected calendar

   - Current date

- Calendar data is centrally controlled by Super Admin

 

**4.21.14 EDGE CASES**

- Missing data → show "No tithi available"

- Multiple calendars for same date → show based on user selection

- Incorrect data → corrected via ticket system

- Calendar change → immediate effect on notifications

 

**4.22 SPIRITUAL COUNTING (DIGITAL MALA / TRACKER)**

**4.22.1 PURPOSE****  
** This module allows members to digitally track their spiritual activities such as mantra chanting, pooja, jatra, and other religious practices.  
  
 It acts as a replacement for traditional mala or physical counting devices by providing a simple in-app counting mechanism.  
  
 **4.22.2 COUNTER TYPES (SUPER ADMIN CONTROL)****  
** Super Admin will create and manage different counting **categories** such as:  
 - Mantra

- TAP

- Jatras

- Jain Visits

Super Admin will create and manage different counting **sub-categories** such as:

**In Mantras**

- Navkar Mantra  
 - Logas  
  
  

**In Jatras**

- Palitana  
 - Girnar

- Sammed Shikharji

And so on  
  
  

**- Jain Temple Visits****  
  
**

Each counter type should be dynamically manageable.  
  
 **4.22.3 MEMBER INTERFACE****  
** - Counters should be displayed as cards (grid/list view)  
 - Each card should include:  
 - Counter Name  
 - Current Count  
 - "+" button (increment)  
 - "−" button (decrement)  
  
 **4.22.4 COUNTING FLOW****  
** - Member clicks "+" → count increases by 1  
 - Member clicks "−" → count decreases by 1 (optional validation to prevent negative values)  
  
 Counting should be:  
 - Instant (real-time update)  
 - Saved automatically  
  
 **4.22.5 RESET FUNCTIONALITY****  
** - Members can reset their counts from settings  
 - Reset should:  
 - Apply to individual counter OR all counters (optional)  
 - Require confirmation before reset  
  
 **4.22.6 DATA STORAGE****  
** - Each member’s count should be:  
 - Stored separately per counter type  
 - Persisted across sessions  
 **4.22.7 TEMPLE ADMIN ACCESS****  
** Temple Admin should be able to:  
 - View counts of members linked to their temple (Primary linked members only)  
 - Access summary such as:  
 - Total counts per member  
 - Total counts per counter type  
  
 **4.22.8 REPORTS (ADMIN)****  
** **Temple Admin can:****  
** - Download reports including:  
 - Member Name  
 - Counter Type  
 - Total Count  
 - Date range  
  
 **Use reports for:****  
** - Engagement tracking  
 - Recognition (e.g., top contributors)  
  
 **4.22.9 LEADERBOARD****  
** Show top members based on counts  
 - Based on:  
 - Individual counters  
 - Overall activity  
  
 **4.22.10 RULES****  
** - Count should not go below zero  
 - All updates should be saved instantly  
 - Counter types are controlled only by Super Admin  
  
 **4.22.11 NOTIFICATIONS****  
** - Reminders for daily practice  
 - Milestone achievements (e.g., 1000 counts completed)  
  
 **4.22.12 EDGE CASES****  
** - App closed during counting → data must persist  
 - Rapid clicking → prevent duplicate/missed increments  
 - Reset action → confirm before execution

 

**5. ADMIN PORTAL (WEB APPLICATION)**

**5.1 OVERVIEW**

The Admin Portal is the central control system of the Jinanam platform.

**It is designed for:**

- Super Admin

- Temple Admin

- Dharmshalas Admin

**The portal will be:**

- Web-based (desktop-first, responsive)

- Data-driven

- Role-based

- Action-oriented (fast operations)

 

**5.2 GENERAL UI/UX REQUIREMENTS**

Sidebar navigation for modules

**Top header with:**

- Notifications

- Profile

- Quick actions

**Dashboard-first approach**

- Table-based data views

- Filters and search in every module

- Minimal clicks for actions

 

**5.3 DASHBOARD**

**5.3.1 PURPOSE**

Provide a real-time overview of system activity and critical alerts.

 

**5.3.2 COMPONENTS**

**1. Live Stats (Top Cards):**

- Total Monks

- Active Journeys

- Today's Arrivals

- Total Donations

**2. Alerts Panel:**

- SOS alerts

- Route delay alerts

**Color Coding:**

- Red → Critical

- Orange → Warning

**3. Incoming Monks:**

- Monk Name

- From Temple → To Temple

- Expected Arrival Time

- Status (On Time / Delayed)

**4. Quick Actions:**

- Add Monk

- Create Route

- Create Event

- Add Booking

 

**5.4 PERSONS (MONK MANAGEMENT)**

**5.4.1 FEATURES**

- Create monk profile

- Edit monk profile

- Assign device

- View journey history

 

**5.4.2 FIELDS (refer separate word file for the same)**

- Name

- Photo

- Current Temple

- Description

- Status

- Emergency Contact

 

**5.4.3 RULES**

- Shared profile across temples

- Editable by all temple admins

- Delete only by Super Admin

 

**5.4.4 AUDIT LOGS**

**Track:**

- Who edited

- What changed

- Timestamp

 

**5.5 LIVE TRACKING**

**5.5.1 FEATURES**

- Map with monk markers

Status colors:

- Green → Moving

- Yellow → Idle

- Red → Offline

 

**5.5.2 DETAILS ON CLICK**

- Monk name

- Battery level

- Last update

- Route

 

**5.5.3 FILTERS**

- Temple

- Route

- Status

- Region

 

**5.6 ROUTES MANAGEMENT**

**5.6.1 FEATURES**

**Create route:**

- A → B → C → D

**Add:**

  - Journey date/time

  - Expected arrival

 

**5.6.2 TRACKING**

- Completed steps

- Delayed steps

- Pending steps

 

**5.7 JOURNEY LOGS**

**5.7.1 FEATURES**

- Timeline view

- Logs of:

- Departure

- Arrival

- Delays

 

**5.7.2 OUTPUT**

- Journey reports

- Delay reports

 

**5.8 TEMPLE MANAGEMENT**

**5.8.1 FEATURES**

- Create/edit temple

- Add details:

- Location

- Contact

- Rules

- Bank details

 

**5.8.2 ADMIN ASSIGNMENT**

- Assign admins

- Manage roles

 

**5.8.3 RULES**

- Only Super Admin creates temple

- No deletion by temple admin

 

**5.9 ACCOMMODATION MANAGEMENT**

**5.9.1 FEATURES**

- Add rooms/halls

- Define:

  - Capacity

  - Price

  - Rules

 

**5.9.2 BOOKING MANAGEMENT**

- View bookings

- Approve/reject

- Track occupancy

 

**5.10 EVENTS MANAGEMENT**

**5.10.1 FEATURES**

- Create event

- Edit event

- View participants

 

**5.10.2 FIELDS**

- Title

- Date/time

- Temple

- Description

 

 

**5.11 FREE EVENTS**

**5.11.1 FEATURES**

- RSVP list

- Attendance tracking

 

**5.11.2 ANALYTICS**

- Participation graph

 

**5.12 PAID EVENTS**

**5.12.1 FEATURES**

- Ticket management

- QR generation

 

**5.12.2 RULES**

- Only Super Admin can create

- Payment gateway required

 

**5.13 TOURS MANAGEMENT**

**5.13.1 FEATURES**

- Create tours

- Manage participants

 

**5.14 VOLUNTEERS MANAGEMENT**

**5.14.1 FEATURES**

- Define requirement

- Approve applicants

- Assign roles

 

**5.15 MEMBERS MANAGEMENT**

**5.15.1 FEATURES**

- View profiles

Track activity:

  - Active

  - Inactive

 

**5.15.2 REPORTS**

- Active vs inactive users

 

**5.16 DEVICES & SIM MANAGEMENT**

**5.16.1 FEATURES**

- Device list:

  - ID

  - Assigned monk

  - Status

 

**5.16.2 SIM MANAGEMENT**

- Operator

- Validity

- Expiry alerts

 

**5.17 BATTERY & ALERT SYSTEM**

**5.17.1 FEATURES**

- Monitor battery

- Generate alerts

 

**5.18 DONATION MANAGEMENT**

**5.18.1 FEATURES**

- View donations

- Verify/reject

- Generate receipts

 

**5.18.2 RECEIPT FORMAT**

- Temple name

- Registration number

- Signature

- Stamp

- 80G info

 

**5.19 COMMUNICATION SYSTEM**

**5.19.1 FEATURES**

- Chat between temples

- Broadcast messages

 

**5.19.2 RULES**

- No deletion by admins

- Only Super Admin can delete

- Messages permanent

 

**5.20 TEMPLE NETWORK**

**5.20.1 FEATURES**

- Incoming monks

- Outgoing monks

- Journey visibility

 

**5.21 REPORTS & ANALYTICS**

**Reports:**

- Donations

- Journeys

- Devices

- Members

 

**5.22 SETTINGS**

**5.22.1 FEATURES**

- Role management

- Alert configuration

- Notification settings

 

**5.23 AUDIT LOGS**

**5.23.1 PURPOSE**

Ensure accountability

**5.23.2 TRACK**

- Donation verification

- Booking approval/rejection

- Route updates

- Device assignment

- Admin actions

 

**5.23.3 FIELDS**

- User

- Action

- Module

- Timestamp

 

**6. SYSTEM LOGIC**

 

**6.1 OVERVIEW**

This section defines the core logic, rules, workflows, and system behaviors that govern how the Jinanam platform operates.

**It includes:**

- Tracking logic (GPS + manual)

- Booking logic

- Donation logic

- Notification logic

- Alert system

- Data validation

- Edge case handling

All logic must be implemented consistently across both Admin Portal and Member Platform.

 

**6.2 TRACKING LOGIC**

**6.2.1 GPS/NAVIGATION-BASED TRACKING**

- Navigation assigned to monk’s personal assistant send location data at configured intervals (30–60 minutes initially)

- Data includes:

- Latitude

- Longitude

- Timestamp

- Device ID

**System Behavior:**

- Backend receives location data

- Updates monk’s latest location

- Displays on:

- Admin dashboard

- Member app (map view)

**Offline Detection:**

- If no update is received within defined threshold:

- Mark monk/device as "Offline"

- Trigger alert

 

**6.2.2 MANUAL TRACKING**

**Purpose:**

- Used when GPS is unavailable or intentionally not used

**Flow:**

1. Temple Admin creates journey:

   - Monk Name

   - Start Temple

   - Next Temple

   - Journey start date/time

   - Expected arrival date/time

 

2. System notifies:

   - Destination temple

   - All upcoming temples in route

 

3. Destination temple updates:

   - Arrived / Delayed / Proceeded

 

4. Journey continues step-by-step:

   - A → B → C → D

 

**Rules:**

- Manual tracking must reflect in:

- Journey logs

- Member app

- Manual and GPS tracking should work independently or together

 

**6.3 ALERT SYSTEM**

**6.3.1 ALERT TYPES**

- Device Offline Alert

- No Movement Alert

- Route Delay Alert

- SOS Alert (highest priority)

 

**6.3.2 ALERT PRIORITY**

- Critical → SOS, Device Offline

- Warning → Battery, Delay

 

**6.3.3 ALERT BEHAVIOR**

- Alerts must be:

- Visible on dashboard

- Sent as notifications

- Alerts should not be repeated excessively

 

**6.4 BOOKING LOGIC**

**6.4.1 BOOKING FLOW**

1. Member selects room/hall

2. Booking request created

3. Payment details shown

4. Member uploads payment proof

5. Admin verifies

6. Booking confirmed

 

**6.4.2 PAYMENT RULE**

- Payment must be completed within 1 hour

**If not:**

  - Booking auto-cancelled

  - Slot released

 

**6.4.3 VALIDATION**

- Prevent double booking

- Ensure availability before confirmation

 

**6.4.4 STATUS**

- Pending

- Payment Pending

- Confirmed

- Cancelled

 

**6.5 DONATION LOGIC**

**6.5.1 TYPES**

- Temple Donation (Manual)

- Jinanam Donation (Online)

 

**6.5.2 FLOW (MANUAL)**

1. Member views bank details

2. Makes payment externally

3. Uploads screenshot

4. Admin verifies

5. Receipt generated

 

**6.5.3 VALIDATION**

- Prevent duplicate payment submission

- Validate screenshot and transaction details

 

**6.5.4 RECEIPT**

- Generated only after verification

- Stored and accessible in member app

 

**6.6 EVENT LOGIC**

**6.6.1 RSVP**

- Members can register

- Admin can view participant list

 

**6.6.2 CAPACITY CONTROL**

- Admin defines max capacity

- Once reached:

- Disable further registration

 

**6.6.3 PAID EVENTS**

- Payment required before confirmation

- QR code generated per booking

 

**6.7 NOTIFICATION LOGIC**

**6.7.1 TRIGGERS**

- Booking confirmation

- Booking cancellation

- Donation verification

- Event creation

- Monk nearby

- SOS alert

 

**6.7.2 CHANNELS**

- App notifications

- WhatsApp

- SMS (optional)

**6.7.3 ARRIVAL NOTIFICATIONS**

- 24 hours before arrival

- 2 hours before arrival

 

**6.8 DATA VALIDATION**

- Mandatory fields must be validated

- Invalid inputs should be rejected

- Duplicate entries should be prevented

 

**6.9 EDGE CASE HANDLING**

- Device offline → Show last known location

- Payment not verified → Show "Pending"

- Duplicate payment → Reject

- Booking not paid → Auto cancel

- Network failure → Retry or show error

 

**6.10 DATA CONSISTENCY**

- All updates must be synchronized across:

- Admin portal

- Member app

- Data must be consistent and up to date

 

**6.11 SECURITY LOGIC**

- Role-based access enforcement

- API validation for every request

- Sensitive data protection

 

**6.12 PERFORMANCE LOGIC**

- System should handle multiple concurrent users

- Optimize API response time

- Avoid delays in tracking updates

 

**7. NON-FUNCTIONAL REQUIREMENTS**

**7.1 OVERVIEW**

This section defines the quality, performance, security, and operational expectations of the Jinanam platform.

These requirements ensure that the system is:

- Reliable

- Secure

- Scalable

- Fast

- User-friendly

These are mandatory and must be considered during system design and development.

 

**7.2 PERFORMANCE REQUIREMENTS**

**7.2.1 RESPONSE TIME**

- All API responses should be fast (preferably \< 2 seconds)

- Critical actions (tracking updates, booking confirmation) should be near real-time

 

**7.2.2 LOAD HANDLING**

- System should handle multiple concurrent users without performance degradation

- Must support:

- Multiple temples

- Large number of members

- Simultaneous tracking updates

 

**7.2.3 OPTIMIZATION**

- Efficient database queries

- Proper indexing

- Caching where required

 

**7.3 SCALABILITY**

**7.3.1 HORIZONTAL SCALING**

- System should be designed to scale across:

- Cities

- States

- Regions

 

**7.3.2 USER SCALING**

- Should support growth in:

- Members

- Admins

- Devices

 

**7.3.3 MODULAR ARCHITECTURE**

- Backend should be modular

- Easy to add new features in future

 

**7.4 RELIABILITY & AVAILABILITY**

**7.4.1 UPTIME**

- System should aim for high availability (99.99%+ uptime)

 

**7.4.2 FAILSAFE MECHANISMS**

- Manual tracking should act as fallback if GPS fails

- System should handle:

- Device failures

- Network issues

- API failures

 

**7.4.3 ERROR RECOVERY**

- System should recover gracefully from failures

- Retry mechanisms for:

- API failures

- Notification failures

 

**7.5 SECURITY REQUIREMENTS**

**7.5.1 AUTHENTICATION**

- Secure login via OTP and password

- Session management required

 

**7.5.2 AUTHORIZATION**

- Role-based access control (RBAC)

- Strict enforcement of permissions

 

**7.5.3 DATA SECURITY**

- Sensitive data must be protected:

- Personal details

- Payment details

 

**7.5.4 API SECURITY**

- All APIs must validate:

- User identity

- Role permissions

 

**7.6 DATA MANAGEMENT**

**7.6.1 DATA CONSISTENCY**

- Data must remain consistent across:

- Admin portal

- Member app

 

**7.6.2 DATA VALIDATION**

- Mandatory fields must be enforced

- Prevent invalid or duplicate data

 

**7.6.3 DATA STORAGE**

- Centralized database

- Proper schema design

 

**7.7 BACKUP & RECOVERY**

**7.7.1 BACKUP**

- Regular automated backups

- Backup frequency:

- Daily (minimum)

 

**7.7.2 RECOVERY**

- Ability to restore data in case:

- System failure

- Data corruption

 

**7.8 NOTIFICATION SYSTEM RELIABILITY**

Notifications should be:

- Delivered reliably

- Not duplicated unnecessarily

**Fallback:**

- If WhatsApp fails → Use SMS

 

**7.9 USABILITY**

**7.9.1 USER EXPERIENCE**

- Simple and intuitive UI

- Minimal steps for actions

- Clear navigation

 

**7.9.2 ACCESSIBILITY**

- Mobile-friendly design

- Easy for non-technical users

 

**7.10 AUDIT & LOGGING**

**7.10.1 LOGGING REQUIREMENTS**

All critical actions must be logged:

- User actions

- System events

 

**7.10.2 AUDIT TRAIL**

Logs must include:

- User ID

- Action

- Timestamp

- Module affected

 

**7.11 ERROR HANDLING**

System should display:

- Clear and user-friendly error messages

**Examples:**

- Payment failed

- Booking failed

- Network issue

 

**7.12 COMPATIBILITY**

Web apps should work on:

- Chrome

- Safari

- Edge

- Mobile app:

- Android

- iOS

 

**7.13 MAINTENANCE & UPDATES**

System should support:

- Easy updates

- Bug fixes without downtime

 

**7.14 FUTURE READINESS**

System should allow:

- Integration of new features

- Expansion to new use cases

- Scaling to other regions

 

**Unique ID Generation System**

To ensure consistency, traceability, and structured data management across the platform, all entities within Jinanam must follow a **system-generated, sequential ID format**. Random or user-defined IDs will not be permitted.

**1. ID Generation Rules**

  - All IDs will be **auto generated by the system** upon creation of a new record.
  - IDs must follow a **fixed prefix + sequential numbering format**.
  - Numbering should always be **continuous and incremental**, starting from the defined base.
  - IDs once generated:
      
      - **Cannot be edited or changed**
      - **Cannot be deleted or reused**
  - No manual overrides or random number generation will be allowed.

 

**2. Entity-wise ID Structure**

|  |  |  |
| :-: | :-: | :-: |
| **Entity Type** | **Prefix** | **Starting Format Example** |
| Temples | JT | 108 |
| Dharamshala’s | JD | 108 |
| Jain Centre | JJC | 108 |
| Monks | JMS | 108 |
| Jain Members | JJM | 108 |
| Non Jain Members | JNJM | 108 |

 

**3. Entity-Specific Logic**

**a. Temples (VT)**

  - When a temple is registered by the Super Admin, the system should automatically assign a unique ID.
  - ID format: JT + 6-digit sequence
  - Example: JT000108, JT000109, ...

**b. Dharamshala’s (VD)**

  - Auto generated upon creation.
  - ID format: JD + 6-digit sequence

**c. Upashray (VU)**

  - Auto generated upon creation.
  - ID format: JU + 6-digit sequence

**d. Members (VM)**

  - Every registered user must have a **unique Member ID**.
  - ID format: JM + 7-digit sequence
  - Example: JM0000108, JM0000109, ...
  - This ID will act as the **primary identifier** for all users across the platform.

 

**4. Member Management Rules**

  - Member IDs:
      
      - Are **permanent and immutable**
      - Cannot be edited by users
  - **Deletion of members**:
      
      - Allowed **only for Super Admin**
  - If Super Admin adds members:
      
      - Each member must receive a **new unique sequential ID**
      - The sequence must continue (no resets or reuse)

 

**5. Key Constraints**

  - No duplicate IDs across the system
  - No gaps caused by reuse of deleted IDs
  - IDs must be **globally unique per entity type**
  - System must ensure **high reliability and atomicity** during ID generation

 

 

 

**Below are the points which we highlighted but may not be mentioned above, so do consider this as well:**

-          Weekly APP Rating popup to the members, if they have rated then it should not pop up to them. But it isn't weekly once.

-          In menu - Help section on how to use this app and its features

-          In Temple we need to add member notifications section – so If any member passing within the radius of 5km of the temple they should get push notifications of nearby temple.

-          Accommodation – A- option of multiple building – so in Dharamshala there are multiple buildings so we want an option where dharmshala will create buildings and name them then add the room/halls details to it. So, members can view that dharmshala and options of buildings and room availability into it.

-          Instead of Monks use term “**MS”**

-          Instead of Accommodation use term **“Dharamshala”**

-          Instead of Temple use term **“Derasar”**

-          Add one more option of bhojanalay List under Temple or separate – In this those temples fill yes for bhojanalay that should be listed here, just those only to view the details. For now, No action, only detail’s view.

-          Add one option of Pathshala Centers under Temple or separate – In this Super Admin will add the details of the centers like name, address with city, state, country and all, contact person will be linked through member and contact details to be viewed in this. As of now No action to members they will just view the details and call them for more information.

-          Also note we have to keep the records of 5yrs of events so all the inactive/expired events we want month and year wise. It should be displayed separately under events. So if the member clicks on the Past events there they have the option to select – Temple/Dharamshala/etc, - Select year - Then dropdown of All the months and in those expired events of that temple/Dharamshala etc.

 

Refer Temporary Menu and Sub-Menu file for Super Admin, Admin and Members. This is just temporary if you have any better suggestions then let us know we can review the same.

-          Also note we have to keep the records of 25yrs of events so all the inactive/expired events we want month and year wise. It should be displayed separately under events. So if the member clicks on the Past events there they have the option to select – Temple/Dharamshala/etc, - Select year - Then dropdown of All the months and in those expired events of that temple/Dharamshala etc.

 

Refer Temporary Menu and Sub-Menu file for Super Admin, Admin and Members. This is just temporary if you have any better suggestions then let us know we can review the same.

  
  
  

# Imp - Visibility Engine  

# **SHORT VERSION**

# **Option 1 – Follow-Based Priority (Highest Priority)**

## **Follow System**

Members can Follow:

  - Temple
  - Dharamshala
  - Sthanaks
  - Jain Center
  - Monks
  - Community Page

Whenever a followed entity publishes:

  - Events
  - Announcements
  - Notices
  - Poll
  - Feed Posts
  - News
  - Updates
  - Volunteer request
  - Tours

those should always appear first in the member's:

  - Home Feed
  - Events
  - Notifications
  - Announcements
  - Polls
  - News

regardless of location.

### **Priority Order**

1.  Followed Entities
2.  Same Community + Current Location
3.  Same Community + Nearby Area
4.  Same Community + State
5.  Same Community + Country
6.  Other Communities (Search Only)

  

# **Option 2 – System Visibility Engine (Default)**

If a member is **not following** any entity, then the platform should automatically prioritize content using the following order:

1.  Same Community + Current Area
2.  Same Community + Nearby Areas
3.  Same Community + State
4.  Same Community + Country
5.  Other Communities (Search Only)

If the member travels to another city, the current location should automatically become the highest priority area.

Members can search and view content from other communities, but it should not be shown by default.

## **Community Rules**

  - Jain members should primarily receive content from their selected Sect/Sub-Community.
  - Members may change their active community from Settings.
  - After switching, the visibility engine should refresh accordingly.

## **Location Rules**

Content priority should automatically use:

  - Current GPS location (if available)
  - Otherwise, registered address

When the member travels, nearby content should automatically become the highest priority.

## **Dharamshala Exception**

Dharamshalas are common facilities.

All members (Jain and Non-Jain) can:

  - View
  - Search
  - Book
  - Receive booking-related updates

without any community restrictions.

  

### **Visibility Logic**

IF Following Entity

    → Highest Priority

  

ELSE

    Same Community + Current Area

    ↓

    Nearby Area

    ↓

    State

    ↓

    Country

    ↓

    Other Communities (Search Only)

  
  

# **DETAILED VERSION**

# **Member Management & Community Visibility Engine**

  

# **Section 1: Unique ID Generation System**

## **Objective**

Every entity created on the platform should receive a permanent, system-generated unique identification number.

These IDs will become the primary reference across the entire platform and will be used for:

  - Search
  - Linking records
  - Donations
  - Member identification
  - Reports
  - Notifications
  - Internal references
  - Future integrations
  - QR Codes and Digital Membership Cards

The Unique ID should be automatically generated by the system and should never be editable by any user or admin.

  

# **Unique ID Structure**

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| **Entity** | **Prefix** | **Starting Number** | **Example** |
| Temple | JFJT | 108 | JFJT108 |
| Monk | JFMS | 108 | JFMS108 |
| Dharamshala | JFD | 108 | JFD108 |
| Jain Center | JFJC | 108 | JFJC108 |
| Jain Member | JFJM | 108 | JFJM108 |
| Non-Jain Member | JFNJM | 108 | JFNJM108 |

  

# **Auto Increment Logic**

Examples:

Temple IDs

 JFJT108  
 JFJT109  
 JFJT110  
 JFJT111

Monk IDs

 JFMS108  
 JFMS109  
 JFMS110

Jain Member IDs

 JFJM108  
 JFJM109  
 JFJM110

The sequence should continue indefinitely.

**IDs can never be reused even if a record is deleted.**

  

# **Business Purpose of Unique IDs**

## **1. Search by ID**

Users should be able to directly search using the ID.

Example:

Search Box

Search:  
 JFJT108

Result:

Shri Adinath Jain Derasar  
 Mumbai – Thane  
 Temple Profile

Same logic should work for:

  - Temple IDs
  - Monk IDs
  - Dharamshala IDs
  - Jain Center IDs

  

## **2. Donations**

Example:

Temple receives an offline cash donation.

Temple Admin opens Donation Screen.

Instead of typing:

Rahul Shah  
Mumbai  
9876543210

Temple admin simply enters:

JFJM108

System should immediately display:

Member Name  
Mobile Number  
Profile Photo  
City & State  
Community

**Donation can then be recorded against that member.**

Benefits:

  - Faster donations
  - No typing mistakes
  - Accurate member mapping
  - Better reporting

  

## **3. Internal Platform Linking**

Unique IDs should become the master reference across modules.

Examples:

 Temple Donations  
 Temple Followers  
 Bookings  
 Volunteer Records  
 Event Registrations  
 Attendance  
 Reports  
 Notifications  
 Membership History

All records should internally use these IDs.

  

# **Member Profile Permanency Rules**

## **Rule 1**

Once a member profile is created, it becomes a permanent record.

Members cannot delete their profile.

Members cannot permanently remove their account.

Reason:

Donation history, registrations, event participation, and platform records are linked to the member profile.

  

## **Rule 2**

Only Super Admin can permanently delete a member profile.

**No other role can delete member records.**

  

# **Admin Permissions**

## **Super Admin**

Can:

✓ Create Members  
 ✓ View Members  
 ✓ Edit Members  
 ✓ Delete Members  
 ✓ Bulk Import Members  
 ✓ Search Members

  

## **Temple Admin**

Can:

✓ Add Members  
 ✓ Bulk Add Members  
 ✓ View Members

Cannot:

✕ Edit Member Profiles  
 ✕ Delete Members

  

## **Dharamshala Admin**

Can:

✓ Add Members  
 ✓ Bulk Add Members  
 ✓ View Members

Cannot:

✕ Edit  
 ✕ Delete

  

## **Jain Center Admin**

Can:

✓ Add Members  
 ✓ Bulk Add Members  
 ✓ View Members

Cannot:

✕ Edit  
 ✕ Delete

  

## **Monk Admin**

Can:

✓ Add Members  
 ✓ Bulk Add Members  
 ✓ View Members

Cannot:

✕ Edit  
 ✕ Delete

  

# **Post Creation Flow**

Admin creates member.

System generates:

JFJM108

System should immediately display:

MEMBER CREATED SUCCESSFULLY

Unique ID:  
 JFJM108

Copy Button

The screen should remain visible:

  - Until admin presses Close  
     OR
  - Until admin navigates back  
     OR
  - Maximum 10 seconds

This allows admins to note down the member ID.

  

# **Bulk Member Addition**

System should support bulk import.

Example:

Excel Upload

Name  
 Mobile  
 City & State  
 Community  
 Address

System automatically creates:

JFJM108  
 JFJM109  
 JFJM110  
 JFJM111

and generates IDs for all imported members.

  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  

# **The below thing is only for jain members, non jain members can view everything.**

  

# **Section 2: Community-Based Content Visibility & Priority Engine**

# **Objective**

The platform should automatically prioritize information based on:

1.  Community
2.  Geographic Location
3.  Followed Entities
4.  Real-Time Travel Location

The goal is:

Right Information  
 Right Community  
 Right Location  
 Right Time

  

# **Community Selection During Registration**

Member Profile

Religion:  
 Jain

Sect:  
 Shwetambar

Sub-Community:  
 Murtipujak

Tradition:  
 Achalgaccha

These selections become the member's default community preferences.

  

# **Community Rule**

A member primarily receives:

Announcements  
 Events  
 Feed Posts  
 Notifications  
 Monk Updates  
 Temple Updates  
 Jain Center Updates

of their selected community only.

Example:

Member

Shwetambar  
 Murtipujak  
 Achalgaccha

Default feed should prioritize:

Shwetambar  
 Murtipujak  
 Achalgaccha

Content.

  

# **Other Communities**

Members can still:

Search Temples  
 Search Monks  
 Search Jain Centers  
 Search Events

of other communities.

However:

Other communities should not appear in priority feed or notifications.

Discovery is allowed.  
 Priority distribution is not.

  

# **Community Switching**

Members should have a setting:

Change Active Community

Example:

Today

Shwetambar  
 Murtipujak

Later

Digambar  
 Bisapanthi

Once switched:

Feed  
 Events  
 Notifications  
 Updates

should refresh based on the newly selected community.

  

# **Location-Based Priority Engine**

Geolocation plays an extremely important role.

Example:

Member Address:

Mumbai  
 Thane West

System should prioritize:

Level 1

Community Updates  
 within Thane West

↓

Level 2

Community Updates  
 within Thane

↓

Level 3

Community Updates  
 within Mumbai

↓

Level 4

Community Updates  
 within Maharashtra

↓

Level 5

Community Updates  
 within India

Radius keeps increasing automatically.

  

# **Example**

Member:

Shwetambar  
 Murtipujak  
 Achalgaccha

Location:

Thane West

Priority Feed:

1.  Temple Updates from Thane West
2.  Monk Updates from Thane West
3.  Jain Center Updates from Thane West
4.  Events in Thane West
5.  Then nearby areas
6.  Then larger areas

All filtered only for:

Shwetambar  
 Murtipujak  
 Achalgaccha

  

# **Travel-Based Dynamic Feed**

Members may travel.

Example:

Home:

Mumbai  
 Thane

Travel:

Palitana

As soon as member reaches Palitana:

System should start prioritizing:

Temple Updates  
 Monk Updates  
 Events  
 Announcements  
 Jain Center Updates

from Palitana.

Again:

Only of the member's community.

  

# **Follow System**

Members should have the ability to Follow:

Temple  
 Monk  
 Jain Center

Examples:

Member follows:

2 Temples  
 6 Monks  
 2 Jain Centers

These followed entities should receive the highest priority.

  

# **Feed Priority Order**

### **Priority 1**

Followed Entities

Temple  
 Monk  
 Jain Center

↓

### **Priority 2**

Same Community + Current Area

↓

### **Priority 3**

Same Community + Nearby Areas

↓

### **Priority 4**

Same Community + State

↓

### **Priority 5**

Same Community + Country

↓

### **Priority 6**

Other Communities via Search Only

  

# **Example Feed**

Member:

Shwetambar  
 Murtipujak  
 Achalgaccha

Lives:

Thane West

Follows:

Temple A  
 Temple B  
 Monk X  
 Monk Y  
 JC Z

Feed Order:

1.  Temple A Announcement
2.  Monk X Update
3.  JC Z Event
4.  Temple B Notice
5.  Thane West Community Updates
6.  Thane Community Updates
7.  Mumbai Community Updates
8.  Maharashtra Community Updates
9.  India Community Updates

No Digambar content should automatically mix into this feed.

  

# **Dharamshala Exception Rule**

Dharamshalas are common facilities.

No community segregation.

All members can:

Search Dharamshalas  
 View Dharamshalas  
 Book Dharamshalas  
 See Dharamshala updates  
 Receive booking notifications

regardless of community.

  

# **Final Visibility Logic**

IF Followed Entity

       ↓

Highest Priority

  

ELSE IF Same Community + Current Location

       ↓

Very High Priority

  

ELSE IF Same Community + Nearby Locations

       ↓

High Priority

  

ELSE IF Same Community + State/Country

       ↓

Medium Priority

  

ELSE

Search Discovery Only

  

# **Final Business Principle**

**Community determines WHAT members see.**

**Location determines WHEN and HOW IMPORTANT it is.**

**Following determines WHO gets absolute priority.**

**Dharamshalas remain visible to everyone irrespective of community.**

This is the core behaviour expected from the Jinanam Member Feed, Events, Announcements and Notification Engine.

  
  

# Jain Members  

**JiNANAM – Jain Member Registration & Profile Form**

 

**ð¤ 1. Basic Personal Information***

**Personal Details**

  - First Name
  - Middle Name
  - Surname
  - Full Name (Auto generated from First + Middle + Surname)
  - Profile Photo Upload (Camera / Gallery)
  - Gender
      
      - Male
      - Female
  - Date of Birth
  - Age (Auto Calculated)
  - If Age ≥ 59 → Automatically mark as **Senior Citizen**
  - Nationality (Default: India | Dropdown - All Countries)
  - Preferred Language
      
      - English (Default)
      - Hindi
      - Gujarati

**Identity Details**

  - PAN Number (Optional)
      
      - Required if member wishes to claim 80G tax benefits or wherever applicable.
  - Aadhaar Number
      
      - Currently only the Aadhaar Number will be collected to prevent duplicate registrations.
      - Future Provision: Aadhaar OTP Verification should be supported without redevelopment.
  - Marital Status
      
      - Single
      - Married
      - Other

 

**ð 2. Community Details***

**Mother Tongue / Community Language**

  - Gujarati
  - Hindi
  - Kutchi
  - Marathi
  - Marwari
  - English
  - Others (Please Specify)

**Jain Community**

**Digambar**

If selected:

Sub Community

  - Bisapantha
  - Terapantha
  - Taranapantha (Samaiyapantha)
  - Gumanapantha
  - Totapantha

**Shwetambar**

If selected:

Sub Community

  - Murtipujak (Deravasi / Mandirmargi)
  - Sthanakvasi
  - Terapanth

If **Murtipujak (Deravasi / Mandirmargi)** is selected:

**Gaccha**

1.  Upkeśa Gaccha
2.  Achal Gaccha
3.  Jiravala Gaccha
4.  Kharatara Gaccha
5.  Lonka (Richmati) Gaccha
6.  Tapa Gaccha
7.  Gangeshvara Gaccha
8.  Korantavala Gaccha
9.  Anandapura Gaccha
10. Bharavali Gaccha
11. Udhaviya Gaccha
12. Gudava Gaccha
13. Dekawa Gaccha
14. Bhinmala Gaccha
15. Mahudiya Gaccha
16. Gachhapala Gaccha
17. Goshavala Gaccha
18. Magatragada Gaccha
19. Vrihmaniya Gaccha
20. Talara Gaccha
21. Vikadiya Gaccha
22. Munjhiya Gaccha
23. Chitroda Gaccha
24. Sachora Gaccha
25. Jachandiya Gaccha
26. Sidhalava Gaccha
27. Miyanniya Gaccha
28. Agamiya Gaccha
29. Maladhari Gaccha
30. Bhavariya Gaccha
31. Paliwala Gaccha
32. Nagadigeshvara Gaccha
33. Dharmaghosha Gaccha
34. Nagapura Gaccha
35. Uchatavala Gaccha
36. Nannavala Gaccha
37. Sadera Gaccha
38. Mandovara Gaccha
39. Surani Gaccha
40. Khambhavati Gaccha
41. Panchanda Gaccha
42. Sopariya Gaccha
43. Mandaliya Gaccha
44. Kochhipana Gaccha
45. Jaganna Gaccha
46. Laparavala Gaccha
47. Vosarada Gaccha
48. Duivandaniya Gaccha
49. Chitravala Gaccha
50. Vegada Gaccha
51. Vapada Gaccha
52. Vijahara Gaccha
53. Kapuri Gaccha
54. Kachala Gaccha
55. Handaliya Gaccha
56. Mahukara Gaccha
57. Putaliya Gaccha
58. Kannariseya Gaccha
59. Revardiya Gaccha
60. Dhandhuka Gaccha
61. Thambhanipana Gaccha
62. Panchivala Gaccha
63. Palanpura Gaccha
64. Gandhariya Gaccha
65. Veliya Gaccha
66. Sadhapunamiya Gaccha
67. Nagarakotiya Gaccha
68. Hasora Gaccha
69. Bhatanera Gaccha
70. Janahara Gaccha
71. Jagayana Gaccha
72. Bhimasena Gaccha
73. Takadiya Gaccha
74. Kamboja Gaccha
75. Senata Gaccha
76. Vaghera Gaccha
77. Vahediya Gaccha
78. Siddhapura Gaccha
79. Ghoghari Gaccha
80. Nigamiya Gaccha
81. Punamiya Gaccha
82. Varhadiya Gaccha
83. Namila Gaccha

**Tithi Calendar**

Select anyone:

  - Gujarati
  - Hindi
  - Kutchi
  - Marathi
  - Marwari
  - Other

 

**ð± 3. Contact & Verification***

**Mobile Number**

  - Country Code
  - Mobile Number
  - OTP Verification (Mandatory)

**WhatsApp Number**

  - Country Code
  - WhatsApp Number
  - OTP Verification (Optional)

**Email ID**

  - OTP Verification (Optional)

**Preferred Communication Method**

  - Mobile
  - WhatsApp
  - Email

**Alternate Contact Number**

  - Country Code
  - Mobile Number

 

**ð 4. Address Details**

**Current Address**

  - Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

**Current GPS Location (Optional)**

Auto Detect Current Location

(Used for Nearby Temples, Dharamshalas, Events & Offers)

 

**Permanent Address**

  - Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

☐ Same as Current Address

 

**Native Village Details**

  - Village
  - Landmark
  - District
  - City
  - State
  - Country
  - Pin Code

 

**ð 5. Temple / Dharamshala / Jain Centre Preferences***

**Preferred Temples (Maximum 5)**

Search & Filter by:

  - Temple Name
  - City
  - State
  - Country
  - Community

**Additional Temples/Monks (Maximum 10)**

Search & Filter available.

**Temple Visit Frequency**

  - Daily
  - Weekly
  - Occasionally

**Favourite Temple**

 

**❤️ 6. Health & Emergency Details**

  - Blood Group
  - Disability (Yes / No)
  - If Yes → Details
  - Physically Handicapped (Yes / No)
  - If Yes → Details
  - Medical Notes
  - Medical Conditions
  - Allergies

**Emergency Contact**

  - Name
  - Relationship
  - Mobile Number

 

**ð¼ 7. Professional Details**

  - Occupation / Profession
  - Organization / Business Name (Optional)

 

**ð 8. Volunteering***

Open for Volunteering

  - Yes
  - No

If Yes

Automatically link with Preferred Temples.

Display in:

  - Temple Volunteer List
  - Member Profile

**Preferred Volunteering Areas**

  - Pooja Seva
  - Event Management
  - Bhojanshala
  - Medical Help
  - Admin / Management
  - Other

**Availability**

  - Morning
  - Afternoon
  - Evening
  - Weekend

Option to select additional temples for volunteering.

 

**ð¨‍ð©‍ð§‍ð¦ 9. Family Members Management**

**Add Family Member**

For each member:

  - Full Name
  - Relationship

Options:

  - Father
  - Mother
  - Husband
  - Wife
  - Son
  - Daughter
  - Brother
  - Sister
  - Grandfather
  - Grandmother
  - Father-in-law
  - Mother-in-law
  - Brother-in-law
  - Sister-in-law
  - Uncle
  - Aunt
  - Cousin
  - Nephew
  - Niece
  - Guardian
  - Other

Mobile Number (Mandatory)

**Family Member Logic**

If Mobile Number already exists

↓

Automatically link existing JiNANAM Member

Otherwise

↓

Create New Member Account and send message

 

**Family Member Account Logic**

  - Duplicate Mobile Number not allowed.
  - Account automatically created.
  - Status:
      
      - Main Member → Active
      - Added Family Member → Inactive

Once the family member logs in and completes their profile:

Status automatically changes to Active.

 

**ð 10. Notification Preferences**

**Service Notifications (Mandatory)**

Select preferred channels:

  - SMS
  - WhatsApp
  - Email
  - Push Notification

**Marketing & Promotional Notifications**

Receive updates regarding:

  - Paid Events
  - Offers & Benefits
  - Marketing Campaigns
  - Advertisements
  - New Services

Select preferred channels:

  - SMS
  - WhatsApp
  - Email
  - Push Notification

 

**ð© Automatic Notifications**

**When Family Member is Added**

Send:

  - SMS
  - App Download Link
  - Login Instructions

 

**When Super Admin / Admin Creates Member**

Send:

  - Account Created
  - Login Instructions
  - App Download Link
  - Support Contact Details

 

**ð 11. Privacy & Controls**

Member should be able to control:

  - Show / Hide Mobile Number
  - Show / Hide Address
  - Allow / Restrict Contact from Other Members

 

**ð·️ 12. User Experience**

Display:

**Profile Completion Percentage**

**Quick Access**

  - My Temples
  - My Family
  - My Donations
  - My Bookings
  - My Events
  - My Offers
  - My Activities

**Badges**

  - Senior Citizen
  - Volunteer
  - Verified

Members should be able to edit their profile anytime.

 

**ð 13. Activity & Engagement**

(Display after member starts using JiNANAM)

  - Events Attended
  - Donations
  - Bookings
  - Seva Activities
  - Volunteer Activities
  - 99 Management Tours
  - Certificates Earned

 

**ð° 14. Currency Preferences**

The system should automatically set the default currency based on the member's selected **Country** during registration.

**Default Currency Logic**

|  |  |
| :-: | :-: |
| **Country** | **Default Currency** |
| India | INR (₹) |
| United Kingdom | GBP (£) |
| United States | USD ($) |
| Canada | CAD (C$) |
| Australia | AUD (A$) |
| United Arab Emirates | AED (د.إ) |
| Singapore | SGD (S$) |
| Kenya | KES (KSh) |
| South Africa | ZAR (R) |
| Other Countries | Based on the official currency of the selected country |

**System Behaviour**

  - The currency should be automatically selected based on the **Country** selected in the member's profile.
  - The detected currency should be displayed as the default currency throughout the JiNANAM platform.
  - Members should have the option to change their preferred currency at any time from their profile settings.
  - Once changed, the selected currency should be used throughout the platform until the member changes it again.
  - If the member updates their country later, the system should suggest updating the default currency accordingly while allowing them to retain their existing preference if desired.

**Usage**

The selected currency should be used across all monetary transactions and displays within the JiNANAM platform, including but not limited to:

  - Donations
  - Paid Events
  - Offers & Benefits
  - Sponsorships
  - Bookings
  - Any future paid services or financial transactions

**Default Behaviour:****  
** The system should always prioritize the currency based on the member's registered country, while allowing manual override from the profile settings.

 

**ð¡️ 15. Security & Validation**

  - Duplicate Mobile Prevention
  - Duplicate Aadhaar Prevention
  - Duplicate Email Prevention
  - OTP Expiry & Retry Logic
  - Basic Fraud Prevention
  - Existing Mobile Number → Redirect to Login

 

**⚙️ 16. Account Status Logic**

Upon successful registration:

Member Status:

Pending OTP

↓

Active

Future Status Options:

  - Active
  - Inactive
  - Blocked
  - Deleted

Family Members remain Inactive until profile completion.

 

**ð 17. Final Submission**

Before registration is completed:

  - Validate Mandatory Fields
  - Validate OTP Verified Fields
  - Generate Unique Member ID
  - Mark Profile Active

Minimum required fields for profile activation:

  - Name
  - Mobile Number
  - Community Selection

 

**ð 18. Consent (Mandatory)**

☐ I agree to the collection and processing of my personal data for using the JiNANAM platform, including services related to Derasar, Dharamshala, Jain Centre, events, bookings, donations, and community coordination.

☐ I consent to sharing my details within the JiNANAM community strictly for operational purposes such as seva coordination, event participation, and related services.

☐ I agree to receive service-related communications, including booking confirmations, receipts, updates, and important notifications via WhatsApp, SMS, email, and push notifications.

☐ I agree to receive promotional and advertising communications, including updates about paid events, marketing campaigns, offers & benefits, and other platform offerings via WhatsApp, SMS, email, and push notifications.

If the member is below 18 years of age:

☐ Guardian/Parent Consent Required.

 

**ð 19. System Generated Information**

The system should automatically maintain:

  - Unique Member ID (Auto Generated – Example: JFJM000001)
  - Registration Date
  - Member Since
  - Last Updated Timestamp
  - Last Login Timestamp

 

**ð¨‍ð¼ 20. Super Admin Controls**

The Super Admin should have permission to:

  - Edit Member Details
  - Override Member Information (where required)
  - Activate / Deactivate Member
  - Delete Member (Soft Delete)
  - View Complete Member Profile
  - Reset Verification Status (if required)

 

**ð 21. Important Notes**

  - The complete profile should remain editable by the member at any time through the Profile section.
  - The **Unique Member ID** cannot be modified under any circumstances.
  - Aadhaar OTP verification is not part of Phase 1 but the platform should be designed with provisions to enable it in future without redevelopment.
  - All personal information should be securely stored and handled according to applicable data protection and privacy regulations.

 

**Final Note (Display)**

**Please ensure all the information provided is accurate and up to date. This information helps JiNANAM deliver better community coordination, temple services, volunteering opportunities, bookings, donations, events, and personalized member experiences.**

 

  
**  
**

# non Jain member**  
**

**JiNANAM – Non-Jain Member Registration & Profile Form**

 

**ð¤ 1. Basic Personal Information***

**Personal Details**

  - First Name
  - Middle Name
  - Surname
  - Full Name (Auto generated from First + Middle + Surname)
  - Profile Photo Upload (Camera / Gallery)
  - Gender
      
      - Male
      - Female
  - Date of Birth
  - Age (Auto Calculated)
  - Nationality (Default: India | Dropdown - All Countries)
  - Preferred Language
      
      - English (Default)
      - Hindi
      - Gujarati

 

**ð± 2. Contact & Verification***

**Mobile Number**

  - Country Code
  - Mobile Number
  - OTP Verification (Mandatory)

**WhatsApp Number**

  - Country Code
  - WhatsApp Number
  - OTP Verification (Optional)

**Email ID**

  - OTP Verification (Optional)

**Preferred Communication Method**

  - Mobile
  - WhatsApp
  - Email

**Alternate Contact Number (Optional)**

  - Country Code
  - Mobile Number

 

**ð 3. Identity Verification**

Every Non-Jain member should receive a unique JiNANAM Member ID.

Example:

**JFNJM0000108**

The Member ID should be auto-generated and remain non-editable.

 

**Government Identity Verification**

Members should upload **any two** of the following identity documents:

  - Aadhaar Card
  - PAN Card
  - Passport
  - Driving Licence
  - Voter ID
  - Other Government ID (Please Specify)

For each uploaded document:

  - Document Number
  - Upload Image
  - Verification Status
  - Upload Date

**Phase 1**

Only collect document details.

**Future Provision**

Support document verification APIs without redevelopment.

 

**ð 4. Address Details***

**Current Address**

  - Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

**Current GPS Location (Optional)**

Auto Detect Current Location

(Used for Nearby Temples, Events, Dharamshalas & Offers)

 

**Permanent Address**

  - Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

☐ Same as Current Address

 

**ð 5. Interests & Platform Preferences**

Members should be able to select their interests.

(Multiple Selection)

  - Temple Visits
  - Spiritual Learning
  - Events
  - Tours
  - Room Bookings
  - Hall Bookings
  - Bhojanshala
  - Volunteering
  - Donations
  - Charity Activities
  - Religious Tourism
  - Other

These interests will be used for recommendations and notifications.

 

**ð 6. Temple Preferences**

Members may follow temples of their choice.

**Favourite Temples**

Search & Filter by:

  - Temple Name
  - City
  - State
  - Country

No minimum or maximum limit.

 

**ð 7. Volunteering**

Open for Volunteering

  - Yes
  - No

If Yes

Preferred Areas

  - Event Management
  - Medical Help
  - Crowd Management
  - Hospitality
  - Food Distribution
  - Administration
  - Other

Availability

  - Morning
  - Afternoon
  - Evening
  - Weekend

 

**❤️ 8. Health & Emergency Details**

(Optional)

  - Blood Group
  - Medical Conditions
  - Allergies

**Emergency Contact**

  - Name
  - Relationship
  - Mobile Number

 

**ð¼ 9. Professional Details**

  - Occupation / Profession
  - Organization / Business Name (Optional)

 

**ð° 10. Currency Preferences**

The system should automatically set the default currency based on the member's selected Country.

Examples:

  - India → INR (₹)
  - United Kingdom → GBP (£)
  - United States → USD ($)
  - UAE → AED (د.إ)

Members may change the preferred currency anytime.

The selected currency will be used throughout the application wherever monetary values are displayed.

 

**ð 11. Notification Preferences**

**Service Notifications**

Select preferred channels:

  - SMS
  - WhatsApp
  - Email
  - Push Notification

**Marketing Notifications**

Receive updates regarding:

  - Events
  - Offers & Benefits
  - Tours
  - Promotions

Select preferred channels:

  - SMS
  - WhatsApp
  - Email
  - Push Notification

 

**ð 12. Privacy & Controls**

Members should be able to control:

  - Show / Hide Mobile Number
  - Show / Hide Address
  - Allow / Restrict Contact from Other Members

 

**ð 13. Activity & Engagement**

(Display after member starts using JiNANAM)

  - Temple Visits
  - Event Participation
  - Bookings
  - Donations
  - Volunteer Activities
  - Tour Participation

 

**ð 14. Account Security**

**Login Method**

  - OTP Login
  - Password Login

**Device Information (Auto Captured)**

  - Device ID
  - Device Type (Android / iOS / Web)
  - Operating System
  - App Version

**Security Logs**

  - IP Address
  - Last Login
  - Login History
  - Device History

 

**⚙️ 15. Account Status**

System Status

  - Pending OTP
  - Active

Super Admin Controls

  - Active
  - Suspended
  - Blocked
  - Deleted (Soft Delete)

 

**ð 16. Final Submission**

Before registration is completed:

  - Validate Mandatory Fields
  - Validate OTP Verification
  - Generate Unique Member ID
  - Activate Profile

Minimum fields required for activation:

  - Name
  - Mobile Number
  - Country

 

**ð 17. Consent (Mandatory)**

☐ I agree to the collection and processing of my personal data for using the JiNANAM platform.

☐ I agree to the Terms & Conditions.

☐ I agree to the Privacy Policy.

☐ I agree to receive service-related communications via SMS, WhatsApp, Email and Push Notifications.

☐ I agree to receive promotional communications regarding events, offers, campaigns and other JiNANAM services.

 

**ð 18. System Generated Information**

The system should automatically maintain:

  - Unique Member ID (Example: JFNJM0000108)
  - Registration Date
  - Member Since
  - Last Login Timestamp
  - Last Updated Timestamp

 

**ð¨‍ð¼ 19. Super Admin Controls**

The Super Admin should have permission to:

  - Edit Member Details
  - Verify Identity Documents
  - Activate / Suspend / Block Members
  - Soft Delete Accounts
  - View Login History
  - View Device History
  - View Activity Logs
  - Reset Verification Status

 

**ð 20. Backend System Logs**

The system should automatically maintain complete audit logs.

Including:

  - Login History
  - Device History
  - IP Address Logs
  - Donation History
  - Booking History
  - Event Participation
  - Volunteer Activities
  - Tour Participation
  - Support Tickets
  - Activity Timeline

These logs should only be accessible to the Super Admin.

 

**ð« 21. Platform Restrictions**

Non-Jain Members:

  - Cannot create Temples, Jain Centres or Dharamshalas.
  - Cannot create Events.
  - Cannot create Polls.
  - Cannot participate in Monk or Temple Administration.
  - Cannot access community management modules reserved for Jain members.
  - Can use all permitted public features such as bookings, donations, events, tours, volunteering, offers, and temple information.

 

**ð 22. Important Notes**

  - The complete profile should remain editable by the member at any time through the Profile section.
  - The Unique Member ID cannot be changed.
  - Government document verification APIs may be integrated in future without redevelopment.
  - Existing mobile numbers should automatically redirect users to the Login screen.
  - Suspicious activities (multiple devices, repeated failed logins, abnormal behaviour, etc.) should be flagged for Super Admin review.
  - All member activities should remain permanently traceable for security and audit purposes.

 

**Final Note (Display)**

**Welcome to JiNANAM. Whether you are visiting a temple, participating in an event, making a donation, volunteering, or simply exploring Jain culture, this platform is designed to provide you with a safe, transparent, and meaningful experience. Please ensure that all information provided is accurate and up to date.**

 

  
**  
**

# Non Jain Staff working in temple**  
**

**JiNANAM – Staff Portal Login & Staff Profile**

 

**1. Staff Creation**

Staff accounts cannot be created through self-registration.

All staff accounts must be created only by the respective Admin or Super Admin through the Staff Management module.

The admin should navigate to:

**Staff Management → Add Staff**

The system should then create a staff profile and generate a unique Staff ID.

Example:

**JFST000001**

The system should also generate a linked JiNANAM Non-Jain Member ID (where applicable) so the staff member can log into the JiNANAM mobile application.

Example:

**JFNJM0000108**

 

**2. Staff Registration Form**

**Basic Information**

  - Full Name
  - Profile Photo
  - Mobile Number (Primary Login ID)
  - Alternate Mobile Number (Optional)
  - Email ID (Optional)
  - Gender
  - Date of Birth
  - Nationality
  - Religion
      
      - Jain
      - Non-Jain

 

**Identity Verification**

The staff member must upload any **two Government Identity Documents**.

Supported Documents:

  - Aadhaar Card
  - PAN Card
  - Passport
  - Driving Licence
  - Voter ID
  - Other Government ID (Please Specify)

For each document:

  - Document Type
  - Document Number
  - Upload Document (Image/PDF)

Future Provision:

Government document verification APIs should be supported without redevelopment.

 

**3. Employment Details**

The Admin should configure:

**Associated Organization**

  - Temple (Derasar)
  - Dharamshala
  - Jain Centre
  - Bhojanshala

The staff member should always belong to one primary organization.

 

**Department / Work Category**

  - Temple Staff
  - Dharamshala Staff
  - Bhojanshala Staff
  - Security Guard
  - Housekeeping
  - Poojari
  - Manager
  - Office Staff
  - Maintenance
  - Driver
  - Gardener
  - Electrician
  - Plumber
  - Volunteer Staff
  - Other (Please Specify)

 

**Designation**

Example:

  - Manager
  - Security
  - Accountant
  - Clerk
  - Reception
  - Cook
  - Cleaner

 

**Joining Date**

 

**Employment Status**

  - Active
  - Inactive
  - Resigned
  - Terminated
  - Retired

 

**4. Address Details**

**Current Address**

  - Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

 

**Permanent Address**

  - Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

☐ Same as Current Address

 

**5. Emergency Details**

  - Emergency Contact Name
  - Relationship
  - Mobile Number
  - Blood Group
  - Medical Conditions
  - Allergies

 

**6. Account Activation**

After the Admin creates the staff profile:

The system should automatically send:

  - OTP Login Link
  - SMS
  - WhatsApp Notification (if available)

The staff member should:

Login

↓

Verify Mobile Number using OTP

↓

Create Password (Optional)

↓

Account Activated

The mobile number should remain the primary login credential.

 

**7. Login Methods**

Staff should be able to login using:

  - OTP Login (Recommended)
  - Password Login

Future Ready:

  - Face Login
  - Biometric Login

 

**8. Role & Permission Management**

Permissions should be completely controlled by the Admin.

The Admin should assign:

**Organization**

  - Temple
  - Dharamshala
  - Jain Centre
  - Bhojanshala

 

**Role**

Examples:

  - Manager
  - Staff
  - Security
  - Reception
  - Accountant
  - Clerk

 

**Module Permissions**

The Admin should be able to grant View, Create, Edit, Approve, Reject, or Delete permissions for each module.

Examples:

  - Visitor Management
  - Staff Management
  - Booking Management
  - Donation Management
  - Event Management
  - Room Management
  - Bhojanshala Management
  - Receipt Management
  - Reports
  - Support Tickets

Permissions should be configurable and role-based.

 

**9. Staff Mobile App**

After login, staff should only see the modules assigned to them.

Examples:

**Dharamshala Staff**

  - Room Bookings
  - Check-In
  - Check-Out
  - Visitor Records

 

**Temple Staff**

  - Donations
  - Visitor Management
  - Event Support

 

**Security Staff**

  - QR Scan
  - Visitor Entry
  - Staff Entry
  - Check-In / Check-Out

 

The home screen should dynamically display only the permitted modules.

 

**10. QR Identity**

Every staff member should automatically receive:

  - Staff ID
  - QR Code

The QR Code should be used for:

  - Staff Entry
  - Staff Exit
  - Attendance
  - Verification

The QR should be downloadable and printable.

 

**11. System Information**

The system should automatically maintain:

  - Staff ID
  - Linked JiNANAM Member ID
  - Created By
  - Created Date
  - Last Updated
  - Last Login
  - Device Information
  - App Version
  - IP Address
  - Status

 

**12. Activity Logs**

Every action performed by staff should be permanently recorded.

Examples:

  - Login
  - Logout
  - Booking Approved
  - Donation Verified
  - Receipt Generated
  - Event Updated
  - Visitor Check-In
  - Visitor Check-Out
  - Attendance Updated

Each log should include:

  - Date & Time
  - Staff Name
  - Staff ID
  - Module
  - Action
  - Device
  - IP Address

 

**13. Notifications**

Staff should receive notifications for:

  - Account Created
  - Password Changed
  - Attendance Updated
  - Leave Approved
  - Leave Rejected
  - Permission Updated

Admins should receive notifications for:

  - New Staff Created
  - Staff Login
  - Failed Login Attempts
  - Permission Changes
  - Staff Not Checked Out
  - Document Expiry

 

**14. Search & Reports**

Admins should be able to search staff using:

  - Staff ID
  - JiNANAM Member ID
  - Mobile Number
  - Name
  - Department
  - Organization

Reports should include:

  - Staff Register
  - Attendance
  - Login History
  - Activity Logs
  - Permission Report
  - Employment Status
  - Document Report

Export Options:

  - PDF
  - Excel
  - CSV

 

**15. Business Rules**

  - Staff accounts can only be created by the Admin or Super Admin.
  - Self-registration should not be permitted.
  - Every staff member should have a unique Staff ID.
  - Every staff member should have a linked JiNANAM Member ID for mobile app access.
  - OTP should be the default login method.
  - Module access should be controlled entirely through Role-Based Permissions.
  - Every staff action should be permanently recorded in the audit log.
  - Staff should only see the modules assigned to them.
  - Admins may modify permissions at any time.
  - Staff records should never be permanently deleted; only deactivated or archived.
  - The system should support both Jain and Non-Jain staff without requiring separate modules.

 

**Final Note**

The Staff Portal should function as a secure, role-based extension of the JiNANAM platform, enabling staff members to access only their assigned responsibilities while ensuring complete auditability, security, and centralized administrative control. The design should remain scalable to support temples, Dharamshalas, Jain Centres, Bhojanshalas, and future JiNANAM-managed organizations worldwide.

 

  
  

# Temple & JC  

**JiNANAM – Temple / Jain Centre Information Form**

**Note:** This same form will be used for both **Temple (Derasar)** and **Jain Centre (JC)**. Wherever "Temple" is mentioned below, the same functionality should apply to Jain Centres by replacing the terminology accordingly.

 

**ð 1. Basic Information**

**Basic Details**

  - Temple / Jain Centre Name
  - Short Name
  - Unique Temple / JC ID (Auto Generated)
  - Trust Name
  - Trust Registration Number
  - Temple / JC Status
      
      - Active
      - Under Renovation
      - Temporarily Closed
      - Permanently Closed

**Logo & Images**

  - Logo / Profile Picture
  - Cover Image Selection
  - Gallery Upload (Maximum 20 Images)
  - Camera / Gallery Upload Support

Suggested Images:

  - Exterior View
  - Interior View
  - Mul Nayak
  - Facilities
  - Upashray
  - Event Hall
  - Bhojanshala
  - Other Important Areas

 

**Community**

**Community**

  - Digambar
  - Shwetambar

**Digambar Sub Community**

*(Managed by Super Admin and configurable)*

Default Options:

  - Bisapantha
  - Terapantha
  - Taranapantha (Samaiyapantha)
  - Gumanapantha
  - Totapantha
  - Kanjipantha
  - Other Digambar Traditions

 

**Shwetambar Sub Community**

  - Murtipujak (Deravasi / Mandirmargi)
  - Sthanakvasi
  - Terapanth

If **Murtipujak** is selected

Display:

**Gaccha**

(Use the predefined Gaccha master list managed by Super Admin.)

 

**Mul Nayak Details**

  - Mul Nayak Bhagwan Name
      
      - Select from predefined Bhagwan Master List
  - Mul Nayak Bhagwan Image
  - Number of Murtis (Optional)

 

**Temple / Jain Centre Type**

  - Shikhar-baddha
  - Griha Chaityalaya (Ghar Derasar)
  - Jain Centre

 

**Tithi Calendar**

Select one (Managed by Super Admin)

  - Gujarati
  - Hindi
  - Kutchi
  - Marathi
  - Marwari
  - Other

 

**Temple / Jain Centre History**

  - Establishment Date
  - Founder/Sponsor Name (Link member) Option to add multiple members
  - Historical Importance
  - Renovation History

For every renovation:

  - Renovation Date
  - Description
  - Sponsor Name (Link member) Option to add multiple members

 

**ð 2. Location Details**

  - Full Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

**GPS Coordinates**

Automatically Capture:

  - Latitude
  - Longitude

**Google Maps**

  - Google Maps Link
  - Open in Google Maps Button

This location should be used for:

  - Nearby Temple Search
  - Nearby Jain Centre Search
  - Notifications
  - Navigation
  - Offers
  - Events

 

**ð¢ 3. Facilities & Accessibility**

**Upashray**

Available?

  - Yes
  - No

If Yes

Select:

  - Within Property
  - Nearby Location

 

**Facilities**

Multiple Selection

  - Lift
  - Wheelchair Access
  - Drinking Water
  - Parking
  - Common Toilets
  - Common Halls
  - Locker Facility
  - Shoe Stand
  - Pooja Clothes Available
  - CCTV
  - Free Wi-Fi
  - Car Charging Point
  - First Aid
  - Other

 

**Event Hall**

Available?

  - Yes
  - No

If Yes

  - Available for Booking
  - Temple Use Only

 

If Available for booking

  - Link details

 

**Parking**

Available?

  - Yes
  - No

If Yes

Location

  - Inside Premises
  - Outside (Roadside)
  - Outside (Paid Parking)

 

**Rooms**

  - AC
  - Non-AC
  - Both

 

**Additional Information**

Description Box

 

**ð 4. Temple Timings**

The system should support multiple timing slots.

Example:

Morning

Start Time

End Time

Afternoon

Start Time

End Time

Evening

Start Time

End Time

 

**Pakshal Timing**

Start Time

End Time

OR

NA

 

**Morning Pooja**

Start Time

End Time

OR

NA

 

**Morning Aarti**

Start Time

End Time

OR

NA

 

**Evening Aarti**

Start Time

End Time

OR

NA

 

**ð¨ 5. Dharamshala Details**

Dharamshala Available?

  - Yes
  - No

If Yes

Display:

  - Link Dharamshala
  - Office Timings
  - Contact Person

Option

  - Same as Temple Contact
  - Select Existing JiNANAM Member
  - Select Existing Non-Jain Member

Contact Number

(Country Code supported)

Online Booking

  - Yes
  - No

 

**ð½ 6. Bhojanshala Details**

Bhojanshala Available?

  - Yes
  - No

If Yes

**Timings**

Breakfast

From – To

Lunch

From – To

Dinner

From – To

 

**Contact Person**

Link Existing:

  - Jain Member
  - Non-Jain Member

 

**Availability**

  - Daily
  - Available on Request

Auto Display Message

If Daily

"Please call and confirm your visit one day prior."

If On Request

"Please call and confirm at least one day prior."

 

**Meal Type**

  - Free
  - Paid

 

**ð 7. Pathshala Details**

Pathshala Available?

  - Yes
  - No

If Yes

Display

  - Timings
  - Days
  - Teacher Name (Link Member)

 

**☎️ 8. Temple Contact Persons**

Multiple Contacts Allowed.

For Jain Members

Search by:

  - Name
  - Mobile
  - Member ID

For Non-Jain

Link Non-member and display below field

Fields

  - Name
  - Mobile Number
  - WhatsApp Number
  - Email
  - Gender

Preferred Contact Method

  - Call
  - WhatsApp
  - Email

Alternate Contact Number

Member contact details should automatically update if linked with a JiNANAM Member.

 

**ð¨‍ð¼ 9. Trustees & Committee Members**

Maximum 20 Members

For each entry

  - Member ID
  - Member Name
  - Designation

Designation

  - Chairman
  - Secretary
  - Treasurer
  - Trustee
  - Committee Member

Search by:

  - Member ID
  - Member Name

Only display

  - Name
  - Member ID

Do not display personal contact details.

One member may hold multiple designations.

 

**ð 10. Volunteer Members**

Link JiNANAM Members.

Display in Member Profile

"Volunteer at this Temple"

A member may volunteer at multiple temples.

 

**ð° 11. Bank & Donation Details**

  - Bank Name
  - Branch
  - Account Number
  - IFSC Code
  - UPI ID

Eligible for:

  - 80G
  - CSR

Donation QR Code Upload

 

**Donation Types Accepted – Allow admins to create the below list**

Multiple Selection

  - General Donation
  - Gochari
  - Pooja
  - Annadan
  - Maintenance
  - Corpus
  - Other

 

**Currency**

The system should automatically set the default currency based on the Temple / Jain Centre Country.

Example:

  - India → INR
  - UK → GBP
  - USA → USD

Admins may change the preferred currency.

Only one currency should remain active.

 

**ð© 12. Dhaja Management**

Maintain records for up to 25 years.

For every year

Display:

  - Dhaja Date
  - Linked Member(s)
  - Description

Support:

  - English
  - Hindi
  - Gujarati

If finalized

Display linked members.

If pending

Display

"Not Yet Finalized"

Future Status

  - Available
  - Booked
  - Pending

  

Chaturmas Management

  

## **12A. Chaturmas Management**

Maintain year-wise records of all Chaturmas conducted at the Temple / Jain Centre.

For every Chaturmas entry, the Admin should configure:

  - Chaturmas Year
  - Start Date
  - End Date
  - Chaturmas Status (if anyone viewing the profile during start and end date then its should show ongoing, if anyone viewing the profile after the end  date then it should show completed)
      
      - Upcoming
      - Ongoing
      - Completed
  - Chaturmas Location (Auto-linked to current Temple / Jain Centre)
  - Link Monks (Multiple Selection)
      
      - Search by Monk Name
      - Monk ID
      - Monk Group
  - Option to link the entire Monk Group
  - Chaturmas Description / Notes (Optional)
  - Chaturmas Sponsors 
      
      - Option to Link multiple members by members id (only name, city and state should be viewed hide the mobile number)
  - Chaturmas Images (option to upload 20 images and 5 links)

### **Display to Members**

The Temple / Jain Centre profile should display:

**Current Chaturmas**

  - Year
  - Start Date
  - End Date
  - Linked Monks (Multiple)

Below that, display:

**Past Chaturmas**

Filter by:

  - Year

 

**⭐ 13. User Reviews**

Members may:

  - Rate (1–5)
  - Comment

Temple Admin

  - Reply to Reviews

Temple Admin cannot delete reviews.

Super Admin

  - Edit
  - Hide
  - Delete Reviews

Automatically display

Average Rating.

 

**ð 14. Events**

Display:

**Upcoming Events**

(Current Active Events)

↓

**Ongoing Events**

↓

**Past Events**

Month-wise

↓

Year-wise

Members should be able to open any event directly.

 

**ð 15. Social Media & Website**

Support:

  - Website
  - Facebook
  - Instagram
  - YouTube
  - X (Twitter)
  - LinkedIn
  - Other Links

Allow unlimited links.

 

**❤️ 16. Member Features**

Members should be able to:

  - Favourite / Bookmark Temple
  - Share Temple
  - Open Google Maps
  - Contact Temple
  - Donate
  - Book Rooms (if available)
  - View Events
  - View Gallery

 

**ð¢ 17. Notices**

Temple Admin should be able to publish an Important Notice.

The latest notice should appear at the top of the Temple profile.

 

**ð 18. Temple Statistics**

Automatically Display

  - Followers
  - Volunteers
  - Reviews
  - Average Rating
  - Events
  - Donations Received (Optional if enabled)

 

**ð¨ 19. Report Incorrect Information**

Members may report incorrect information.

Selecting this option should automatically create a Support Ticket.

The member should also be able to track the ticket status within the JiNANAM app.

 

**ð¡ 20. Audit Information**

Automatically maintain:

  - Created By
  - Created Date
  - Last Updated By
  - Last Updated Date

Display

"Last Updated On"

 

**ð 21. Final Disclaimer**

Display at the bottom of every Temple / Jain Centre page:

**"All the above timings, facilities, contact details, and other information are subject to change. Visitors are advised to contact the respective Temple / Jain Centre directly to confirm the latest information before planning their visit."**

 

**⚙️ 22. Business Rules**

  - All fields are optional during Phase 1 onboarding.
  - The same profile structure should be used for both Temple and Jain Centre modules.
  - Community, Sub-Community, Gaccha, Bhagwan List, and Tithi Calendars should be managed through configurable master data by the Super Admin.
  - Every Temple / Jain Centre should have a unique system-generated ID.
  - GPS coordinates should be captured automatically and used across navigation, nearby search, notifications, and recommendations.
  - Only one active currency should be maintained per Temple / Jain Centre profile.
  - Linked JiNANAM Member information should always remain synchronized with the latest member details.
  - Reviews can only be deleted or hidden by the Super Admin.
  - All profile changes should be recorded in the audit logs.
  - The complete Temple / Jain Centre profile should remain editable by the respective Admin and Super Admin at any time.
  - One Temple / Jain Centre may have multiple monks linked to a single Chaturmas.
  - A monk may be linked to only one active Chaturmas during the same period.
  - Chaturmas records should be maintained permanently and should never be deleted.
  - Admins may edit Chaturmas details only while the Chaturmas is Upcoming or Ongoing.
  - Once the Chaturmas is completed, only the Super Admin can modify the record.
  - Linking or removing a monk should automatically update the Monk Profile.

 **  
**

# Dharamshala**  
**

**ð¨ Dharamshala Information Form**

**ð¹ 1. Basic Information**

  - **Dharamshala Name**
  - ****Trust Name****
  - **Trust Registration Number**
  - **Logo/Profile Pic**
  - **Dharamshala Images Upload**
      
      - Upload 10–12 images
      - Option to capture via camera or upload from gallery
      - **Recommended: Exterior, rooms, washrooms, dining, reception, parking**
  - Community (Dropdown – Single Select)
      
      - Digambar
      - Shwetambar
  - Sub Community for digambar (we are still figuring out the list so give the option to superadmin to create this) for timebeing you create the below
      
      - Bisapantha
      - Terapanthi
      - Taranapantha or Samaiyapantha
      - Gumanapantha
      - Totapanthi
      - Kanjipanthi 
      - Other Digambar Traditions 
  - Sub Community for Swetambar
      
      - Murtipujak (Deravasi/Mandirmargi)
      - Sthanakvasi
      - Terapanth
  - If selected Murtipujak (Deravasi/Mandirmargi) then below sub options - Gachh 
      
      - 1. Upkeśa Gaccha
      - 2. Achal Gaccha
      - 3. Jiravala Gaccha
      - 4. Kharatara Gaccha
      - 5. Lonka (Richmati) Gaccha
      - 6. Tapa Gaccha
      - 7. Gangeshvara Gaccha
      - 8. Korantavala Gaccha
      - 9. Anandapura Gaccha
      - 10. Bharavali Gaccha
      - 11. Udhaviya Gaccha
      - 12. Gudava Gaccha
      - 13. Dekawa Gaccha
      - 14. Bhinmala Gaccha
      - 15. Mahudiya Gaccha
      - 16. Gachhapala Gaccha
      - 17. Goshavala Gaccha
      - 18. Magatragada Gaccha
      - 19. Vrihmaniya Gaccha
      - 20. Talara Gaccha
      - 21. Vikadiya Gaccha
      - 22. Munjhiya Gaccha
      - 23. Chitroda Gaccha
      - 24. Sachora Gaccha
      - 25. Jachandiya Gaccha
      - 26. Sidhalava Gaccha
      - 27. Miyanniya Gaccha
      - 28. Agamiya Gaccha
      - 29. Maladhari Gaccha
      - 30. Bhavariya Gaccha
      - 31. Paliwala Gaccha
      - 32. Nagadigeshvara Gaccha
      - 33. Dharmaghosha Gaccha
      - 34. Nagapura Gaccha
      - 35. Uchatavala Gaccha
      - 36. Nannavala Gaccha
      - 37. Sadera Gaccha
      - 38. Mandovara Gaccha
      - 39. Surani Gaccha
      - 40. Khambhavati Gaccha
      - 41. Panchanda Gaccha
      - 42. Sopariya Gaccha
      - 43. Mandaliya Gaccha
      - 44. Kochhipana Gaccha
      - 45. Jaganna Gaccha
      - 46. Laparavala Gaccha
      - 47. Vosarada Gaccha
      - 48. Duivandaniya Gaccha
      - 49. Chitravala Gaccha
      - 50. Vegada Gaccha
      - 51. Vapada Gaccha
      - 52. Vijahara Gaccha
      - 53. Kapuri Gaccha
      - 54. Kachala Gaccha
      - 55. Handaliya Gaccha
      - 56. Mahukara Gaccha
      - 57. Putaliya Gaccha
      - 58. Kannariseya Gaccha
      - 59. Revardiya Gaccha
      - 60. Dhandhuka Gaccha
      - 61. Thambhanipana Gaccha
      - 62. Panchivala Gaccha
      - 63. Palanpura Gaccha
      - 64. Gandhariya Gaccha
      - 65. Veliya Gaccha
      - 66. Sadhapunamiya Gaccha
      - 67. Nagarakotiya Gaccha
      - 68. Hasora Gaccha
      - 69. Bhatanera Gaccha
      - 70. Janahara Gaccha
      - 71. Jagayana Gaccha
      - 72. Bhimasena Gaccha
      - 73. Takadiya Gaccha
      - 74. Kamboja Gaccha
      - 75. Senata Gaccha
      - 76. Vaghera Gaccha
      - 77. Vahediya Gaccha
      - 78. Siddhapura Gaccha
      - 79. Ghoghari Gaccha
      - 80. Nigamiya Gaccha
      - 81. Punamiya Gaccha
      - 82. Varhadiya Gaccha
      - 83. Namila Gaccha

 

**ð¹ 2. Temple Inside Dharamshala Premises**

*(Only visible if Dharamshala has temple)*

  - Temple Available Inside? – Yes / No

If **Yes**, then show:

  - Mul Nayak Bhagwan Name
  - Mul Nayak Image
  - Temple Type
      
      - Shikhar-baddha
      - Griha Chaityalaya
  - Select Tithi Calendar
  - Temple Opening Days & Hours
  - Pakshal Timings
  - Morning Pooja Timings
  - Evening Pooja Timings

 

**ð¹ 3. Location Details**

  - **Full Address**
  - **Nearest Landmark**
  - **Nearest Railway Station / Bus Stop**
  - **District** (e.g., Mulund East / West)
  - **City**
  - **State**
  - **Pin Code**
  - **Country**
  - **Google Maps Link**
      
      - **Add "Open in Maps" button**
  - **General Contact Number**

 

**ð¹ 4. Accommodation Details (This is temporary - Contact us while creating this we need to discuss on this) We are confused to this here or in booking so let’s connect on this.**

**ð¢ Building Management**

  - **Number of Buildings**
  - **Add Building**

For each Building:

 

**ð¢ Building Details**

  - **Building Name / Identifier (Added)****  
    ** (e.g., Building A, New Wing, Old Building)
  - **Building Images (Added)**

 

**ð Room Type Details (Inside Each Building)**

  - Room Type Name  
     (e.g., AC Room, Non-AC Room, Dormitory, Common Hall)
  - Room Category
      
      - AC / non-AC
      - Dormitory / Private / Common Hall
  - **Number of Rooms for this Type**
  - Bed Capacity per Room  
     (e.g., 2 bed, 4 bed, 10 bed)
  - Room Charges
      
      - Per Room / Per Bed
  - Security Deposit
  - Attached Bathroom
      
      - Yes / No
  - **Amenities in Room**
      
      - Fan / AC
      - Geyser
      - Cupboard
      - etc.

 **⏱ Stay Details (Common or per building – configurable)**

  - Check-in Time
  - Check-out Time
  - Advance Booking Required – Yes/No
  - Online Booking Available – Yes/No

 **ð Feature**

  - **Availability Status**
      
      - High Availability
      - Limited
      - Full

Admin should have option to block/hold the rooms which should be shown as booked to the members but in reality, it is hold/blocked by Admin.

 

**ð¹ 5. Facilities & Amenities**

  - **Facilities (multi-select)**
      
      - Rooms
      - Halls
      - Pooja Facility
      - Attached Bathroom
      - Hot Water
      - Parking
      - Lift
      - Wheelchair Accessibility
      - Drinking Water
      - Wi-Fi
  - **Upashray Available in Property**
      
      - Yes / No

 

**ð¹ 6. Bhojanalay / Food Facility**

  - Bhojanalay Available – Yes / No

If **Yes**, then:

  - Breakfast Charges & Timings
  - Lunch Charges & Timings
  - Dinner Charges & Timings
  - Contact Person (Jain / Non-Jain logic same as temple)
  - Availability:
      
      - Available Daily
      - Available on Request
  - Auto Message:
      
      - *"Please call and confirm one day prior."*

 

**ð¹ 7. Contact & Management**

  - **Primary Contact Person**
      
      - Link Member (Search by Name / Mobile / Member ID)
      - Profile of that person to be seen (Full Name, Mobile, Male/Female)
  - **Secondary Contact Number**
  - Option to link multiple members
  - Option to link non-Jain member

**Contact Verification**

  - Mobile Number
      
      - OTP Verification (Mandatory)
  - WhatsApp Number
      
      - OTP Verification (Optional)
  - Email ID
      
      - OTP Verification (Optional)
  - **Primary Contact Preference**
      
      - Mobile / WhatsApp / Email

**ð¹ 8. Trustees & Committee Members**

**Trustees (Max 20)**

|  |  |  |
| :-: | :-: | :-: |
| **Name (Linked Member)** | **Member ID (Auto)** | **Designation** |

 

  

**ð¹ 9. Volunteer Members**

  - Link Members as Volunteers
  - Reflect in member profile:  
     *“Volunteer at this Dharamshala”*

 

**ð¹ 10. Bank & Donation Details**

  - Account Number
  - Bank Name
  - Branch
  - IFSC Code
  - UPI ID
  - **80G Eligibility**
      
      - Yes / No
  - **CSR Eligibility**
      
      - Yes / No
  - **Donation QR Code Upload**

 

**ð¹ 11. Rules & Guidelines**

  - **Dharamshala Rules Section**
      
      - Check-in requirements (ID proof, Jain only, etc.)
      - Stay limits
      - Cleanliness rules
      - Silence / discipline rules

 

**ð¹ 12. Safety & Support**

  - **Emergency Contact**
  - **Caretaker / Manager Details**

 

**ð¹ 13. User Experience Enhancements**

  - Live Availability Status
  - Follow / Bookmark Dharamshala
  - Share Option (WhatsApp / Link)
  - Report Incorrect Info
  - Last Updated Date (Auto)

Links – Insta, Facebook, Website, YouTube, other. (option of adding more)

**ð¹ 14. Final Disclaimer**

*Display at bottom:*

“All the above timings, charges, and availability are subject to change. Kindly contact the (Name of Dharamshala) directly to confirm before planning your stay.”

  

Note – As of now don’t keep it as a mandatory field, keep all the fields as optional.

  
  
  

# Booking Management (Dharamshala)  

# **In this 3 things are there - Setup, Bookings and Stay** 

  

# **Accommodation Setup & Booking Management**

## **Purpose**

This module is used only to configure the Dharamshala once and manage all booking requests.

No check-in/check-out happens here.

  

# **A. Initial Setup (One Time Configuration)**

Before accepting any bookings, the Dharamshala Admin should configure the property.

  

## **1. Dharamshala Information**

  - Dharamshala Name
  - Logo
  - Address
  - GST/PAN (Optional)
  - Trust Name
  - Contact Details
  - Bank Details
  - UPI Details
  - Currency (Auto based on Country)
  - Terms & Conditions
  - Cancellation Policy

  

## **2. Receipt Template Setup**

This template will be used for all receipts.

Fields

  - Dharamshala Logo
  - Dharamshala Name
  - Trust Name
  - Address
  - Contact Number
  - Email
  - Website
  - PAN Number
  - GST Number (Optional)
  - Registration Number (Optional)
  - UPI QR (Optional)
  - Footer Message
  - Terms & Conditions
  - Authorized Signature
  - Stamp Upload

This setup is done once.

  

# **B. Accommodation Inventory Setup**

Admin should first create the accommodation inventory.

Accommodation Types

  - Room
  - Dormitory
  - Common Hall
  - Hall
  - Cottage
  - Apartment
  - Suite
  - Other

  

## **Room Setup**

Fields

  - Building
  - Floor
  - Room Number
  - Room Category
  - AC / Non AC
  - Maximum Capacity
  - Images
  - Amenities
  - Charges
  - Security Deposit
  - Minimum Stay
  - Maximum Stay
  - Booking Allowed
  - Reservation Allowed
  - Room Rules
  - Status

  

## **Dormitory Setup**

Fields

  - Building
  - Floor
  - Dormitory Name
  - Maximum Capacity
  - Male / Female / Family
  - Locker Available
  - Locker Charges
  - Mattress Included
  - Images
  - Amenities
  - Charges
  - Minimum Stay
  - Maximum Stay
  - Booking Allowed
  - Reservation Allowed
  - Dormitory Rules
  - Status

  

## **Common Hall Setup**

Fields

  - Hall Name
  - Building
  - Floor
  - Maximum Capacity
  - Male / Female / Family
  - Locker Available
  - Locker Charges
  - Mattress Included
  - Images
  - Amenities
  - Charges
  - Minimum Stay
  - Maximum Stay
  - Booking Allowed
  - Reservation Allowed
  - Hall Rules
  - Status

  

## **Hall Setup**

Fields

  - Hall Name
  - Capacity
  - Images
  - Amenities
  - Booking Charges
  - Security Deposit
  - Hall Rules
  - Status

  

## **Cottage / Apartment / Suite**

Same setup as Room.

  

## **Locker Setup**

Some Dharamshalas provide lockers without accommodation.

Separate inventory.

Fields

  - Locker Number
  - Location
  - Charges
  - Deposit
  - Status

Booking separately.

  

# **C. Booking Rules**

Each accommodation type can have different rules.

Examples

Room

  - Family Allowed
  - Jain Only
  - Pets Not Allowed
  - Check-in Time

Dormitory

  - Separate Male/Female
  - Silence Hours
  - Shared Washroom

Common Hall

  - Bring Own Bedding
  - Shared Hall
  - Lights Off Timing

Hall

  - Decoration Rules
  - Cleaning Charges
  - Security Deposit

All rules should be selection-based with an optional notes field.

  

# **D. Booking Management**

Booking Sources

  - Member App
  - Walk-In
  - Phone
  - Admin

  

Booking Flow

Member

↓

Select Accommodation

↓

View Availability

↓

Submit Booking

↓

Admin Reviews

↓

Approve / Reject

↓

Payment Required?

↓

Member uploads payment proof

↓

Admin verifies

↓

Booking Confirmed

  

Booking Status

  - Pending
  - Approved
  - Rejected
  - Waiting List
  - Reserved
  - Confirmed
  - Cancelled
  - No Show

  

Reservation

Admin can reserve accommodation for

  - VIP
  - Monk
  - Trust
  - Internal Use
  - Festival
  - Maintenance
  - Other

  

Calendar View

Admin should see

  - Today's Bookings
  - Upcoming Bookings
  - Cancelled
  - Waiting
  - Reservations

  

Reports

  - Booking Report
  - Reservation Report
  - Waiting List
  - Revenue
  - Cancellation
  - Accommodation Utilization

  

Notifications

Members

  - Booking Submitted
  - Booking Approved
  - Payment Pending
  - Booking Confirmed
  - Reminder Before Arrival
  - Booking Cancelled

Admins

  - New Booking
  - Payment Uploaded
  - Cancellation Request

  

# **Stay Management**

## **Purpose**

This module starts only after the booking has been confirmed or a walk-in guest arrives.

This module is used by the reception/front desk staff for daily operations.

# **A. Check-In**

Reception opens booking.

Click

Check-In

Capture

  - Check-In Date
  - Check-In Time
  - Allocate Accommodation
  - Number of Guests
  - Additional Guests
  - Vehicle Number (Optional)
  - ID Verification (Optional)
  - Remarks

Accommodation Status automatically changes to Occupied.

# **B. Accommodation Allocation**

Accommodation can be allocated

  - During Booking Confirmation

OR

  - During Check-In

Supports

  - Room
  - Dormitory
  - Common Hall
  - Hall
  - Cottage
  - Apartment
  - Suite

# **C. Stay Operations**

During stay, Admin can

  - Extend Stay
  - Transfer Accommodation
  - Add Additional Guests
  - Add Internal Notes
  - Add Additional Charges
  - Change Accommodation
  - Update Guest Count

Entire history should be maintained.

# **D. Stay Extension**

Admin clicks

Extend Stay

↓

Select Additional Days

↓

System checks availability

↓

Updates amount

↓

Updates check-out date

Same booking continues.

# **E. Accommodation Transfer**

Examples

Room 101

↓

Room 202

Dormitory

↓

Room

Hall

↓

Dormitory

Complete history maintained.

# **F. Housekeeping**

Accommodation Status

  - Clean
  - Dirty
  - Under Cleaning
  - Ready

Automatically updated after checkout.

# **G. Maintenance**

Admin can block accommodation.

Reason

Expected Completion Date

Status

Under Maintenance

# **H. Check-Out**

Reception clicks

Check-Out

System calculates

  - Stay Duration
  - Accommodation Charges
  - Additional Charges
  - Deposit Adjustment
  - Discounts
  - Outstanding Amount
  - Final Amount

# **I. Payment Collection**

Payment Modes

  - Cash
  - UPI
  - Bank Transfer
  - Credit Card
  - Debit Card
  - Cheque
  - Complimentary

Support Split Payment.

Example

₹1000 Cash

₹500 UPI

# **J. Receipt Generation**

Automatically generate

  - Booking Receipt
  - Payment Receipt
  - Stay Receipt
  - Final Receipt

Available in

  - Admin Portal
  - Member App
  - Email
  - WhatsApp

# **K. Live Stay Dashboard**

Reception should always see

Accommodation

↓

Status

ð¢ Available

ð´ Occupied

ð¡ Reserved

ðµ Cleaning

⚫ Maintenance

Live occupancy count

Today's arrivals

Today's departures

Today's extensions

Pending payments

Revenue

# **L. Reports**

  - Occupancy Report
  - Stay Report
  - Check-In Report
  - Check-Out Report
  - Accommodation Report
  - Revenue Report
  - Payment Report
  - Extension Report
  - Maintenance Report
  - Housekeeping Report

Export

  - Excel
  - PDF

# **M. Member App**

Members should be able to

  - View Booking
  - View Allocated Accommodation
  - View Stay Status
  - View Check-In
  - View Check-Out
  - Download Receipts
  - View Payment History
  - View Stay History
  - Request Stay Extension (Optional)

# **Business Rules**

  - The Dharamshala Admin should complete the **Initial Setup**, **Receipt Template**, and **Accommodation Inventory** before accepting any bookings.
  - Accommodation should be managed using predefined accommodation types (Room, Dormitory, Common Hall, Hall, Cottage, Apartment, Suite, Other), each with its own configurable rules and amenities.
  - Booking Management and Stay Management must remain separate modules while sharing the same accommodation inventory.
  - Every accommodation unit should have a unique identity (e.g., Room Number, Hall Name, Dormitory Name, Cottage Number).
  - Accommodation can be allocated either at the time of booking confirmation or during check-in.
  - Stay extensions should update the existing booking rather than creating a new one.
  - All accommodation transfers, extensions, payments, check-ins, check-outs, and receipts should be permanently stored for audit and reporting.
  - Receipt templates should be configured once by the Dharamshala Admin and reused automatically for all booking, payment, and stay receipts.
  - The system should minimize manual typing by using dropdowns, multi-select options, predefined rules, and configurable masters wherever possible, ensuring ease of use for non-technical Dharamshala administrators.

  
  

# MS  

**JiNANAM – MS (Maharaj Saheb / Sadhvi) Profile Form**

 

**ð¹ 1. Basic Information**

**Personal Details**

  - Full Name (Diksha Name)
  - Short Name / Popular Name (Optional)
  - Unique MS ID (Auto Generated)
  - Profile Photo
  - Gender
      
      - Sadhu
      - Sadhvi
  - Date of Birth
  - Place of Birth
  - Name Before Diksha
  - Short Bio (3–5 lines summary)

**Current Status**

  - Active
  - Vihaar
  - Chaturmas
  - Samadhi

If applicable:

  - Date of Nirvana

 

**ð¹ 2. Diksha & Spiritual Journey**

**Diksha Details**

  - Diksha Date
  - Diksha Place
      
      - Address
      - City
      - State
      - Country
      - Pincode

**Diksha Guru**

  - Link Existing MS Profile

**Community**

**Community**

  - Digambar
  - Shwetambar

**Digambar Sub Community**

(Managed by Super Admin)

Default Options:

  - Bisapantha
  - Terapantha
  - Taranapantha (Samaiyapantha)
  - Gumanapantha
  - Totapantha
  - Kanjipantha
  - Other Digambar Traditions

**Shwetambar Sub Community**

  - Murtipujak (Deravasi / Mandirmargi)
  - Sthanakvasi
  - Terapanth

If Murtipujak is selected

Display:

**Gaccha**

(Managed by Super Admin through Master List)

 

**ð¹ 3. Guru–Disciple Hierarchy**

Display complete Guru Parampara.

Fields:

  - Diksha Guru
  - Acharya Guru (Parent Guru)
  - Current Sangh / Acharya (Optional)
  - Dikshit Disciples (Auto Linked)
  - Guru Parampara Tree (Auto Generated)

Members should be able to navigate through the Guru lineage.

 

**ð¹ 4. Current Vihaar Group**

MS never travels alone.

Maintain the current Vihaar group.

Fields:

  - Group Number – Generate unique ID starts from JFMSV108
  - Group Name -
  - Group Leader – link MS here
  - Link Other MS Profiles
  - Link non-Jain members
  - Link Jain members (who are always there with them)
  - Total Group Members (auto count of this)
  - Notes

Members should be able to open any linked MS profile directly.

 

**ð¹ 5. Family Details (Pre-Diksha)**

**Father**

  - Link JiNANAM Member (if available)
  - Otherwise, Text Entry

**Mother**

  - Link JiNANAM Member
  - Otherwise, Text Entry

**Siblings**

Multiple Entries

Fields:

  - Name
  - Relationship
  - Link Member (if available)

**Family Location**

Complete Address

  - Area
  - City
  - State
  - Country
  - Pincode

 

**ð¹ 6. Life Events & Milestones**

Maintain a complete timeline.

Examples:

  - Diksha
  - Chaturmas
  - Vihaar
  - Pravachan
  - Major Contributions
  - Special Announcements
  - Important Events

For every event:

  - Event Name
  - Date
  - Place
  - Description

Timeline should automatically display:

Day

↓

Month

↓

Year

Announcements created elsewhere in JiNANAM should automatically appear in this timeline.

## **ð¹ Events & Pravachan History**

Automatically display all events linked to the MS profile.

This section should be system-generated based on the Event Management module and should not require separate data entry.

For every linked event, display:

  - Event Title
  - Event Type
  - Event Date
  - Venue
  - Temple / Jain Centre
  - City
  - State
  - Event Status
      
      - Upcoming
      - Ongoing
      - Completed

Members should be able to open the event directly from the MS Profile.

### **Event History**

Display events in the following order:

  - Upcoming Events
  - Ongoing Events
  - Past Events

Provide filters:

  - Month-wise
  - Year-wise

  

**ð¹ 7. Tapasya (Spiritual Practices)**

Tapasya Master should be managed by Super Admin.

Examples:

  - Upvas
  - Ayambil
  - Varsitap
  - Other

For each Tapasya:

  - Tapasya Name
  - Number Completed
  - Date
  - Place
  - Description
  - Status
      
      - Ongoing
      - Completed
  - Completion Date

Timeline View should be generated automatically.

 

**ð¹ 8. JiNANAM Tracking**

Display current movement information.

Fields:

  - Current Location
  - Current Temple / Jain Centre / Upashray
  - Current City
  - Current State
  - Current Country
  - Last Known Location Timestamp

Current Status

  - Staying
  - Moving
  - Chaturmas

Maintain complete Vihaar History:

  - From
  - To
  - Dates

Upcoming Vihaar

Future GPS tracking should integrate directly with this module.

 

**ð¹ 9. Chaturmas Details**

Maintain complete Chaturmas history.

For every Chaturmas:

  - Chaturmas Year
  - Start Date
  - End Date

Status

  - Upcoming
  - Ongoing
  - Completed

Linked Organization

  - Temple
  - Jain Centre
  - Upashray

Location

  - City
  - State
  - Country

Members should be able to open the linked Temple / Jain Centre / Upashray directly.

**Chaturmas History**

Display year-wise.

Example:

2026 – Shree Adinath Jain Derasar, Mumbai

2025 – Shree Mahavir Jain Derasar, Surat

2024 – Jain Centre, Jaipur

This section should remain automatically synchronized with the Temple / Jain Centre Chaturmas Management module.

 

**ð¹ 10. Daily Routine & Interaction**

Display daily routine.

**Pravachan Timings**

Support multiple slots.

Morning

Afternoon

Evening

**Darshan / Interaction Timings**

Morning

Afternoon

Evening

**Maryada / Guidelines**

Text Box

**Special Instructions**

Examples:

  - Silence Please
  - No Photography
  - No Mobile Phones
  - Prior Permission Required

 

**ð¹ 11. Language & Communication**

Languages Spoken / Pravachan Language

  - Hindi
  - Gujarati
  - Marathi
  - Marwari
  - English
  - Other

Multiple Selection Supported.

 

**ð¹ 12. Health & Availability**

Current Health Status

  - Stable
  - Under Care
  - Travel Restricted
  - Not Available for Darshan

Sensitive information should remain visible only to authorized users.

 

**ð¹ 13. Media & Content**

**Image Gallery**

Categories

  - Diksha
  - Pravachan
  - Vihaar
  - Chaturmas
  - Tapasya
  - Old Photos
  - Other

**Videos**

Unlimited Video Links

**Audio**

Pravachan Audio

**Publications**

  - Books
  - Articles
  - PDFs

**Recent Announcements**

Automatically display latest announcements.

 

**ð¹ 14. About / Biography**

Detailed Life Story

No character limit.

 

**ð¹ 15. Associations**

Display all linked organizations.

Support:

  - Temple
  - Jain Centre
  - Dharamshala
  - Upashray

Display current association first.

**Sangh Contact Persons**

Maintain separate contact details for both **Jain** and **Non-Jain** persons associated with the MS.

**1. Jain Contact Person(s)**

Link Existing JiNANAM Member(s).

Search by:

  - Member ID
  - Name
  - Mobile Number

Display automatically:

  - Member Name
  - City
  - State
  - Mobile Number

Allow linking of multiple Jain contact persons.

 

**2. Non-Jain Contact Person(s)**

Link Existing Non-Jain Member(s).

Search by:

  - Non-Jain Member ID
  - Name
  - Mobile Number

Display automatically:

  - Name
  - City
  - State
  - Mobile Number

Allow linking of multiple non-Jain contact persons.

 

**3. Direct Contact Numbers (Optional)**

For the MS/Sangh, provide direct communication numbers.

Fields:

  - Calling Number (with Country Code)
  - WhatsApp Number (with Country Code)

Both fields should be optional and editable by the authorized Admin/Super Admin.

 

**ð¹ 16. Recognition & Identity**

Titles / Honors

Known For

  - Pravachan
  - Tapasya
  - Guidance
  - Literature
  - Spiritual Leadership

Tags

  - Senior MS
  - Tapasvi
  - Pravachan Expert
  - Chaturmas Available

Awards / Recognition

 

**ð¹ 17. System & Linking**

Unique MS ID (Auto Generated)

Automatically Link:

  - Temples
  - Jain Centres
  - Dharamshalas
  - Upashray
  - Events
  - Community Feed
  - News
  - Members
  - Chaturmas

All linked information should remain synchronized automatically.

 

**ð¹ 18. Statistics**

Automatically Display

  - Followers
  - Chaturmas Completed
  - Pravachans
  - Tapasya Count
  - Group Members
  - Events

 

**ð¹ 19. Upcoming Events**

Automatically display:

Upcoming Events

↓

Ongoing Events

↓

Past Events

Month-wise

↓

Year-wise

Members should be able to open any linked event directly.

 

**ð¹ 20. Admin & Verification**

Verified Profile Badge

Managed By

  - Super Admin
  - Assigned Admin

Duplicate Detection

Based on:

  - Name
  - Diksha Date
  - Guru
  - Community

 

**ð¹ 21. Privacy & Sensitivity Controls**

Restrict visibility of:

  - Family Details
  - Health Details
  - Internal Notes

Only authorized users should access sensitive information.

 

**ð¹ 22. Notifications & Engagement**

Members should be able to:

  - Follow MS
  - Favourite MS
  - Bookmark MS

Followers should automatically receive notifications for:

  - Vihaar Updates
  - Chaturmas Updates
  - Pravachan Updates
  - Travel Updates
  - New Events
  - Announcements
  - Community Feed Posts
  - News

 

**ð¹ 23. Search & Discoverability**

Search By:

  - MS Name
  - Guru
  - Community
  - Gaccha
  - Current Temple
  - Chaturmas City
  - Current City
  - Current State
  - Tags

 

**ð¹ 24. Report Incorrect Information**

Members should be able to report incorrect information.

Selecting this option should automatically create a Support Ticket.

The Support Ticket should be assigned to:

  - Assigned Admin
  - Super Admin

Members should be able to track the ticket status from their JiNANAM App.

 

**ð¹ 25. Official Digital Presence**

  - Website
  - Facebook
  - Instagram
  - YouTube
  - X (Twitter)
  - LinkedIn
  - Other Links

Support unlimited links.

 

**ð¹ 26. Audit Information**

Automatically Maintain:

  - Created By
  - Created Date
  - Last Updated By
  - Last Updated Date
  - Verified By
  - Verification Date

Display:

**Last Updated By and Last Updated On**

 

**ð¹ 27. Final Note**

Display at the bottom of every MS Profile:

*"All information is maintained with utmost respect and accuracy. Members are advised to verify important details with the respective Sangh or authorized representatives whenever required."*

 

**⭐ Member Features**

Members should be able to:

  - Follow MS
  - Favourite / Bookmark MS
  - Share MS Profile
  - View Current Chaturmas
  - View Vihaar History
  - View Guru Parampara
  - View Group Members
  - View Tapasya Timeline
  - View Events
  - View Announcements
  - View Associated Temples / Jain Centres / Upashrays
  - Contact Representative
  - Report Incorrect Information

 

**⚙️ Business Rules**

  - Every MS Profile should have a unique system-generated MS ID.
  - Guru–Disciple hierarchy should be maintained automatically through profile linking.
  - Current Vihaar Groups should always remain synchronized across all linked MS profiles.
  - Chaturmas information should be managed from the Temple / Jain Centre module and automatically reflected in the MS Profile.
  - All linked modules (Events, Feed, News, Chaturmas, Associations, GPS Tracking) should remain synchronized automatically.
  - Followers should receive notifications based on their notification preferences.
  - Family and Health information should be protected through privacy controls.
  - All profile changes should be recorded in audit logs.
  - The complete MS Profile should remain editable by the Super Admin and the assigned Admin at any time.
  - Multiple Jain and Non-Jain contact persons can be linked to a single MS Profile.
  - If a linked Member updates their profile (Name, City, State, Mobile Number), the MS Profile should automatically reflect the latest information.
  - Members should only see the authorized contact details configured for the MS Profile.
  - Only the Super Admin and the assigned Admin should have permission to add, edit, or remove contact persons and contact numbers.
  - Events should automatically appear in the MS Profile whenever an MS is linked during event creation.
  - Removing the linked MS from an event should automatically remove that event from the MS Profile.
  - All linked event information should remain synchronized between the Event Management module and the MS Profile.
  - Members should have read-only access to this section, while only authorized Admins and the Super Admin can manage event associations through the Event module.  

# Stanak  

# **JiNANAM – Stanak Information Form**

  

# **ð 1. Basic Information**

### **Basic Details**

  - Stanak Name
  - Short Name
  - Unique Stanak ID (Auto Generated)
      
      - Format: **JFSK000001**
  - Trust Name
  - Trust Registration Number
  - Stanak Status
      
      - Active
      - Under Renovation
      - Temporarily Closed
      - Permanently Closed

  

### **Logo & Images**

  - Logo / Profile Picture
  - Cover Image
  - Gallery Upload (Maximum 20 Images)
  - Camera / Gallery Upload

Suggested Images

  - Front View
  - Prayer Hall
  - Meditation Hall
  - Upashray
  - Bhojanshala
  - Library
  - Facilities
  - Other Areas

  

### **Community (Fixed)**

Community

  - Shwetambar

Sub Community

  - Sthanakvasi

These fields should not be editable.

  

### **Tithi Calendar**

Select from Super Admin Master

  - Gujarati
  - Hindi
  - Kutchi
  - Marathi
  - Marwari
  - Other

  

### **About Stanak**

  - Establishment Date
  - Founder Name (Link JiNANAM Members) Option to link multiple members
  - About Stanak

Renovation History

For every renovation

  - Date
  - Description
  - Sponsor (Link Member)

# **ð 2. Location Details**

  - Full Address
  - Landmark
  - Area
  - District
  - City
  - State
  - Country
  - Pin Code

Automatically Capture

  - Latitude
  - Longitude

Google Maps

  - Google Maps Link
  - Open in Google Maps

# **ð¢ 3. Facilities**

Available Facilities

  - Upashray
  - Bhojanshala
  - Library
  - Meditation Hall
  - Pravachan Hall
  - Lift
  - Wheelchair Access
  - Drinking Water
  - Parking
  - Toilets
  - Shoe Stand
  - CCTV
  - First Aid
  - Free Wi-Fi
  - Other

  

### **Parking**

Available

Yes / No

If Yes

  - Inside
  - Outside
  - Paid Parking

  

### **Additional Information**

Description Box

  

# **ð 4. Timings**

Support multiple slots.

**Morning**

Start Time

End Time

**Afternoon**

Start Time

End Time

**Evening**

Start Time

End Time

  

### **Pravachan Timings**

**Morning -** Start Time - End Time

**Afternoon -** Start Time - End Time

**Evening -** Start Time - End Time

OR

NA

  

### **Samayik Timings**

Morning at 

Evening at

OR

NA

  

# **ð¨ 5. Upashray Details**

Available

Yes / No

# **ð½ 6. Bhojanshala Details**

**Available**

Yes / No

**If Yes**

Breakfast From - To

Lunch - From - To

Dinner - From - To

Contact Person - Link member

Availability

  - Daily
  - On Request

Meal Type

  - Free
  - Paid

# **ð 7. Pathshala Details**

Available

Yes / No

If Yes

  - Timings
  - Days
  - Teacher Name (Link Member)

  

# **☎️ 8. Contact Persons**

Multiple Contacts Allowed.

For Jain Members

Search by

  - Member ID
  - Name
  - Mobile

For Non-Jain

Search by

  - Member ID
  - Name
  - Mobile

Preferred Contact

  - Call
  - WhatsApp
  - Email

  

# **ð¨‍ð¼ 9. Trustees & Committee**

Maximum 20 Members

Fields

  - Member ID
  - Member Name
  - Designation

Designation

  - President
  - Vice President
  - Secretary
  - Joint Secretary
  - Treasurer
  - Trustee
  - Committee Member
  - Other

One member may hold multiple designations.

  

# **ð 10. Sadhu / Sadhvi Association**

Link multiple MS Profiles.

Members should be able to open the linked MS profile directly.

  

# **ð 11. Chaturmas Management**

Maintain complete Chaturmas history.

For every Chaturmas

  - Year
  - Start Date
  - End Date
  - Linked MS (Multiple)
  - Status
  - Linked Stanak
  - City
  - State
  - Country

History should remain permanently available.

The linked MS profile should automatically display this Stanak under its Chaturmas History.

  

# **ð¥ 12. Volunteer Members**

Link JiNANAM Members.

Display in Member Profile

Volunteer at this Stanak

  

# **ð° 13. Donation Details**

  - Bank Account Name
  - Bank Account Number
  - IFSC Code
  - Bank Name
  - Branch Address
  - UPI ID
  - Currency
  - QR Code upload
  - 80G
  - CSR

Donation Categories (Option to create by individual admins)

  - General Donation
  - Annadan
  - Upashray
  - Maintenance
  - Corpus
  - Library
  - Other

Currency

Automatically selected based on Country.

Admin may change.

Only one currency is active.

# **ð 14. Events**

**Display**

  - Upcoming Events
  - Ongoing Events
  - Past Events

Members can directly open the event.

# **ð¢ 15. Notices**

Latest Notices

Important Announcements

Auto display at the top.

  

# **⭐ 16. Reviews**

Members can

  - Rate
  - Review

Admin

  - Reply

Only Super Admin

  - Edit
  - Hide
  - Delete

  

# **ð 17. Social Media**

  - Website
  - Facebook
  - Instagram
  - YouTube
  - LinkedIn
  - X
  - Other Links

Unlimited links.

  

# **❤️ 18. Member Features**

Members can

  - Follow Stanak
  - Favourite Stanak
  - Share Stanak
  - Contact Stanak
  - Donate
  - Book Facilities (if enabled)
  - View Events
  - View Gallery
  - Open Google Maps

  

# **ð 19. Statistics**

Display

  - Followers
  - Volunteers
  - Reviews
  - Average Rating
  - Events
  - Donations (Optional)

  

# **ð¨ 20. Report Incorrect Information**

Members may report incorrect information.

Automatically create a Support Ticket.

Members can track ticket status.

  

# **ð¡ 21. Audit Information**

Automatically maintain

  - Created By
  - Created Date
  - Last Updated By
  - Last Updated Date

Display

Last Updated On

# **ð 22. Business Rules**

  - Every Stanak should have a unique system-generated Stanak ID (Format: **JFSK000001**).
  - Community is permanently fixed as **Shwetambar → Sthanakvasi** and cannot be modified.
  - All profile fields should remain editable by the Stanak Admin and Super Admin.
  - GPS coordinates should be automatically captured and used for Nearby Search, Maps, Notifications, and Recommendations.
  - Multiple MS profiles can be linked to a Stanak, and the relationship should be synchronized with the corresponding MS profiles.
  - Chaturmas history should be permanently maintained and visible from both the Stanak profile and the linked MS profiles.
  - All linked JiNANAM Member information should remain synchronized with the latest member details.
  - Reviews may only be edited, hidden, or deleted by the Super Admin.
  - All profile changes should be recorded in the Audit Logs.
  - The entire profile should support multiple languages where applicable.

  
  

# Gods  

**If you can give super admin the access to create then it will be very good. We will do the septup of gods.**  
  

**Two options we want -** 

  

24 Tirthankars 

Others

  

If selected 24 Tirthankars then: 

#### 1 Rishabhdev /or Adinath Bhagwan

#### 2 Ajitnath Bhagwan

#### 3 Sambhavnath Bhagwan

#### 4 Abhinandannath Bhagwan

#### 5 Sumatinath Bhagwan

#### 6 Padmaprabh Bhagwan

#### 7 Suparshawanath Bhagwan

#### 8 Chandraprabh Bhagwan

#### 9 Pushpdant Bhagwan

#### 10 Sheetalnath Bhagwan

#### 11 Shriyansnath Bhagwan

#### 12 Vaasupujya Bhagwan

#### 13 Vimalnath Bhagwan

#### 14 Anantnath Bhagwan

#### 15 Dharamnath Bhagwan

#### 16 Shantinath Bhagwan

#### 17 Kunthunath Bhagwan

#### 18 Arahnath Bhagwan

#### 19 Mallinath Bhagwan

#### 20 MuniSuvratnath Bhagwan

#### 21 Naminath Bhagwan

#### 22 Neminath Bhagwan

#### 23 Parshwanath Bhagwan

#### 24 Mahavir Swami Bhagwan

  

#### If selected other then below:

  - #### Nakoda Bhairav
  - #### Bhomiyaji Maharaj
  - #### Naigamesha
  - #### Kshetrapal Dada
  - #### Manibhadra Veer
  - #### Ghantakarna Mahavir Bhagwan
  - Below is the list of 108 Parshvanath bhagwan

  

|  |  |
| :-: | :-: |
| ### Shri Ajhara Parshvanath | ### Shri Mahadeva Parshvanath |
| ### Shri Alokik Parshvanath | ### Shri Makshi Parshvanath |
| ### Shri Amijhara Parshvanath | ### Shri Mandovara Parshvanath |
| ### Shri Amrutjhara Parshvanath | ### Shri Manoranjan Parshvanath |
| ### Shri Ananda Parshvanath | ### Shri Manovanchit Parshvanath |
| ### Shri Antariksh Parshvanath | ### Shri Muhri Parshvanath |
| ### Shri Ashapuran Parshvanath | ### Shri Muleva Parshvanath |
| ### Shri Avanti Parshvanath | ### Shri Nageshvar Parshvanath |
| ### Shri Bareja Parshvanath | ### Shri Nagphana Parshvanath |
| ### Shri Bhabha Parshvanath | ### Shri Navasari Parshvanath |
| ### Shri Bhadreshvar Parshvanath | ### Shri Nakoda Parshvanath |
| ### Shri Bhateva Parshvanath | ### Shri Navapallav Parshvanath |
| ### Shri Bhayabhanjan Parshvanath | ### Shri Navkhanda Parshvanath |
| ### Shri Bhidbhanjan Parshvanath | ### Shri Navlakha Parshvanath |
| ### Shri Bhiladiya Parshvanath | ### Shri Padmavati Parshvanath |
| ### Shri Bhuvan Parshvanath | ### Shri Pallaviya Parshvanath |
| ### Shri Champa Parshvanath | ### Shri Panchasara Parshvanath |
| ### Shri Chanda Parshvanath | ### Shri Phalvridhi Parshvanath |
| ### Shri Charup Parshvanath | ### Shri Posali Parshvanath |
| ### Shri Chintamani Parshvanath | ### Shri Posina Parshvanath |
| ### Shri Chorvadi Parshvanath | ### Shri Pragatprabhavi Parshvanath |
| ### Shri Dada Parshvanath | ### Shri Ranakpura Parshvanath |
| ### Shri Dharnendra Parshvanath | ### Shri Ravana Parshvanath |
| ### Shri Dhingadmalla Parshvanath | ### Shri Shankhala Parshvanath |
| ### Shri Dhiya Parshvanath | ### Shri Stambhan Parshvanath |
| ### Shri Dhrutkallol Parshvanath | ### Shri Sahastraphana Parshvanath |
| ### Shri Dokadiya Parshvanath | ### Shri Samina Parshvanath |
| ### Shri Dosala Parshvanath | ### Shri Sammetshikhar Parshvanath |
| ### Shri Dudhyadhari Parshvanath | ### Shri Sankatharan Parshvanath |
| ### Shri Gadaliya Parshvanath | ### Shri Saptaphana Parshvanath |
| ### Shri Gambhira Parshvanath | ### Shri Savara Parshvanath |
| ### Shri Girua Parshvanath | ### Shri Serisha Parshvanath |
| ### Shri Godi Parshvanath | ### Shri Sesali Parshvanath |
| ### Shri Hamirpura Parshvanath | ### Shri Shamala Parshvanath |
| ### Shri Hrinkar Parshvanath | ### Shri Shankeshver Parshvanath |
| ### Shri Jiravala Parshvanath | ### Shri Sirodiya Parshvanath |
| ### Shri Jotingada Parshvanath | ### Shri Sogatiya Parshvanath |
| ### Shri Jagavallabh Parshvanath | ### Shri Somchintamani Parshvanath |
| ### Shri Kesariya Parshvanath | ### Shri Sphuling Parshvanath |
| ### Shri Kachulika Parshvanath | ### Shri Sukhsagar Parshvanath |
| ### Shri Kalhara Parshvanath | ### Shri Sultan Parshvanath |
| ### Shri Kalikund Parshvanath | ### Shri Surajmandan Parshvanath |
| ### Shri Kalpadhrum Parshvanath | ### Shri Svayambhu Parshvanath |
| ### Shri Kalyan Parshvanath | ### Shri Tankala Parshvanath |
| ### Shri Kamitpuran Parshvanath | ### Shri Uvasaggaharam Parshvanath |
| ### Shri Kankan Parshvanath | ### Shri Vadi Parshvanath |
| ### Shri Kansari Parshvanath | ### Shri Vahi Parshvanath |
| ### Shri Kareda Parshvanath | ### Shri Vanchara Parshvanath |
| ### Shri Koka Parshvanath | ### Shri Varanasi Parshvanath |
| ### Shri Kukadeshvar Parshvanath | ### Shri Varkana Parshvanath |
| ### Shri Kunkumarol Parshvanath | ### Shri Vighnapahar Parshvanath |
| ### Shri Lodhan Parshvanath | ### Shri Vignahara Parshvanath |
| ### Shri Lodrava Parshvanath | ### Shri Vijaychintamani Parshvanath |
| ### Shri Manmohan Parshvanath | ### Shri Vimal Parshvanath |

  

#### (Don't give any numbers to the above, just name)

#### Since the registration of the Derasar is done by Super-Admin, you can give an option to create God name so super-admin will first create the god name (If not in the list) then he will link the same over there.

  

#### Likewise you can give to others also. If you give the option to super-admin he will create first then link/select.

  

#### Also  refer this link - <https://en.wikipedia.org/wiki/List_of_tirthankaras> For more info.

  
  

# Subscription & Billing Management  

# **Organization Subscription & Billing Management**

## **Purpose**

The Subscription & Billing module will be used to manage **Platform Access** for all organizations registered on the JiNANAM platform.

**This module is applicable only to Organizations and their Admins.**

JiNANAM Member accounts (Jain and Non-Jain Members) will always remain **Free for Lifetime** and are **not part of this subscription system**.

The subscription should always belong to the **Organization**, not to individual Admin users.

Whenever an Admin logs in, the system should validate the subscription status of the associated Organization before granting access.

# **ð¢ Supported Organization Types**

The subscription engine should support all organization types available on the JiNANAM platform.

Supported Organization Types:

  - Temple
  - Jain Centre
  - Dharamshala
  - Temple + Dharamshala
  - Jain Centre + Dharamshala
  - Stanaks 
  - Stanaks+Dharamshala
  - MS
  - Community Pages / Groups

The architecture should be generic enough to support additional organization types in the future without redevelopment.

# **ð¦ Subscription Plans**

The Super Admin should have complete control to create and manage subscription plans.

Each Subscription Plan should contain:

  - Plan Name
  - Description
  - Organization Type
  - Plan Type
      
      - Free
      - Complimentary
      - Paid
  - Plan Duration
      
      - Monthly
      - Quarterly
      - Half-Yearly
      - Yearly
      - Two Years
      - Three Years
      - Custom Duration
  - Currency
  - Subscription Amount
  - Tax (GST/VAT if applicable)
  - Grace Period
  - Status
      
      - Active
      - Inactive

Initially, all organizations will be assigned **Free / Complimentary Plans**, while the payment module remains disabled.

# **⚙ Organization Subscription Assignment**

Whenever a new Organization is created, the Super Admin should assign:

  - Subscription Plan
  - Start Date
  - Expiry Date

Access Types:

  - Complimentary
  - Trial
  - Paid
  - Lifetime

The assigned subscription should immediately become active for the entire organization.

All Admin users linked to that organization should automatically inherit the organization's subscription status.

# **ð¨‍ð¼ Admin Access Logic**

Admin accounts should **not** have separate subscriptions.

Instead:

Organization

↓

Subscription

↓

Admin Users

If an organization has multiple Admins, all of them should use the same subscription.

Example:

Temple ABC

Subscription:

Premium Plan

Admins:

  - Admin 1
  - Admin 2
  - Admin 3
  - Admin 4

If Admin 2 resigns and Admin 5 joins, the subscription remains unchanged because it belongs to the Temple, not the individual Admin.

# **ð§© Module-Based Subscription Engine**

Instead of creating separate subscription plans for each organization type, the system should use a **Module-Based Subscription Engine**.

For every subscription plan, the Super Admin should decide which modules are enabled.

Example:

Temple Plan

Enabled Modules:

  - Temple Management
  - MS Management
  - Chaturmas
  - Events
  - Feed
  - Polls
  - Announcements
  - News
  - Donations
  - Bookings
  - Visitor Management
  - Staff Management
  - Reports

Temple + Dharamshala Plan

Enabled Modules:

  - Temple
  - Dharamshala
  - Bhojanshala
  - Booking Management
  - Donations
  - Visitors
  - Staff
  - Events
  - Feed
  - Reports

Community Page Plan

Enabled Modules:

  - Community Page
  - Feed
  - Events
  - Polls
  - News
  - Reports

This approach avoids maintaining separate subscription logic for every organization type and makes the platform highly scalable.

# **ð Subscription Dashboard**

The Super Admin should be able to view:

  - Total Organizations
  - Active Subscriptions
  - Complimentary Plans
  - Paid Plans
  - Trial Plans
  - Lifetime Plans
  - Expired Subscriptions
  - Expiring in 30 Days
  - Expiring in 15 Days
  - Expiring in 7 Days
  - Renewed Today

Search by:

  - Organization Name
  - Organization Type
  - Organization ID
  - City
  - State
  - Subscription Plan

Filters:

  - Active
  - Complimentary
  - Paid
  - Expired
  - Trial
  - Lifetime

# **ð Subscription Status**

Every Organization should display:

Current Subscription Plan

Subscription Status

  - Active
  - Expiring Soon
  - Expired
  - Suspended

Subscription Start Date

Expiry Date

Days Remaining

Renewal Date

# **ð Renewal Notification Engine**

Automatic reminders should be sent before subscription expiry.

Notification Schedule:

  - 30 Days Before Expiry
  - 15 Days Before Expiry
  - 7 Days Before Expiry
  - Daily during the Last 7 Days
  - On Expiry Date

Notification Channels:

  - In-App Notification
  - WhatsApp
  - Email
  - SMS (Optional)

# **ð§¾ Invoice Generation**

The system should automatically generate a Renewal Invoice before subscription expiry.

Invoice Details:

  - Invoice Number
  - Invoice Date
  - Organization Name
  - Organization ID
  - Subscription Plan
  - Plan Duration
  - Subscription Amount
  - Tax Details
  - Total Amount
  - Due Date

Invoices should be available:

  - Admin Portal
  - Email
  - WhatsApp (PDF)

# **ð³ Renewal Process (Future Ready)**

Initially, the payment module will remain disabled.

When enabled in the future:

The Organization Admin should be able to:

  - Select Renewal Duration
      
      - 1 Year
      - 2 Years
      - 3 Years
      - Custom (if enabled)
  - View Invoice
  - Make Online Payment

Supported Payment Methods:

  - UPI
  - Net Banking
  - Debit Card
  - Credit Card
  - International Cards
  - Other payment methods configured by the Super Admin

# **⚡ Automatic Activation**

After successful payment, the system should automatically:

  - Verify Payment
  - Unlock the Organization
  - Extend Subscription Validity
  - Update Expiry Date
  - Generate Receipt
  - Send Confirmation Notification

No manual intervention should be required.

# **ð Receipt Management**

Every successful payment should generate:

  - Tax Invoice
  - Payment Receipt

Receipts should remain permanently available under:

**Organization → Subscription → Payment History**

Options:

  - View
  - Download PDF
  - Print

# **ð Payment History**

Maintain complete payment history.

For every renewal, store:

  - Invoice Number
  - Plan Name
  - Duration
  - Payment Date
  - Amount
  - Tax
  - Receipt
  - Payment Status

No records should ever be deleted.

# **ð Organization Lock Logic**

When the subscription expires:

The **Organization** should automatically become locked.

All Admin users associated with that organization should lose access to management modules.

Display a full-screen message:

**Your JiNANAM Platform Access Plan has expired.**

Please renew your subscription to continue managing your organization.

For assistance, please contact the JiNANAM Office.

Buttons:

  - Contact JiNANAM Office
  - Renew Subscription (when enabled)

Even after locking, Admins should still have access to:

  - Subscription Details
  - Payment History
  - Invoices
  - Receipts
  - Support

All operational modules should remain inaccessible until the subscription is renewed.

# **ð Complimentary & Manual Access**

The Super Admin should have the ability to:

  - Grant Complimentary Access
  - Grant Trial Access
  - Grant Lifetime Access
  - Extend Subscription Validity
  - Change Subscription Plan
  - Suspend Subscription
  - Unlock Organization

All actions should be logged in the Audit Trail.

  

# **⏳ Grace Period**

The Super Admin should be able to configure a Grace Period for every subscription plan.

Example:

  - 3 Days
  - 7 Days
  - 15 Days
  - Custom

Organizations should continue to access the platform during the grace period.

Once the grace period ends, the system should automatically lock the organization.

  

# **ð Audit Logs**

Maintain complete audit history.

Track:

  - Plan Creation
  - Plan Modification
  - Plan Assignment
  - Renewal
  - Invoice Generation
  - Payment
  - Receipt Generation
  - Subscription Extension
  - Lock
  - Unlock
  - Suspension

Capture:

  - User
  - Date & Time
  - IP Address
  - Action Performed

  

# **⚙ Business Rules**

  - Subscription belongs to the **Organization**, not to individual Admin users.
  - All Admins linked to the same organization automatically inherit the organization's subscription status.
  - JiNANAM Members (Jain and Non-Jain) remain **free for lifetime** and are not part of the subscription system.
  - Initially, the platform will use **Free/Complimentary Plans** while keeping the online payment module disabled.
  - The payment gateway can be enabled at any time by the Super Admin without requiring software redevelopment.
  - Subscription plans should use a **Module-Based Subscription Engine**, allowing the Super Admin to enable or disable specific modules for each organization type.
  - Invoice generation, renewal reminders, payment processing, receipt generation, subscription activation, and account locking should all be automated.
  - All invoices, receipts, subscription history, and audit logs should be permanently stored and available for download.
  - The entire Subscription & Billing module should be fully configurable by the Super Admin without requiring any code changes.

  

## **ð Note for Development Team**

The Subscription & Billing module has been designed with a **future-ready architecture**. Although JiNANAM does not intend to charge organizations during the initial launch, we want the complete subscription framework to be developed from the outset so that billing can be activated in the future through configuration rather than redevelopment.

The solution should therefore be built as a **generic Organization Subscription Engine** with a **Module-Based Access Control System**, ensuring scalability, flexibility, and minimal future development effort.

  
  

# Feed Management  

**JiNANAM – Community Feed Management**

The Community Feed is one of the core engagement modules of the JiNANAM platform. It should intelligently display relevant updates to every member based on their preferences, Jain community, followed entities, and geographic location. The objective is to ensure that every member receives personalized, meaningful, and location-aware content rather than a generic chronological feed.

 

**1. Feed Priority Engine**

The Community Feed should use a **Priority-Based Smart Feed Engine** instead of a simple chronological timeline.

The feed should display content in the following order of priority:

**Priority 1 – Followed Entities (Highest Priority)**

Display posts from entities that the member follows.

Supported entities:

  - Temples
  - Jain Centres
  - Monks
  - Monk Groups
  - Dharamshalas

Example:

If a member follows:

  - Shree Adinath Derasar
  - Acharya Shri ABC
  - Palitana Jain Centre

Then updates from these entities should always appear at the top of the feed.

 

**Priority 2 – Community Visibility Engine**

The second priority should follow the JiNANAM Community Visibility Engine.

Example:

Shwetambar

↓

Murtipujak

↓

Achalgaccha

The member should primarily receive:

  - Temple Updates
  - Monk Updates
  - Events
  - Notices
  - News
  - Community Posts

only from **Shwetambar → Murtipujak → Achalgaccha**.

Likewise,

Digambar

↓

Bisapantha

↓

Only Bisapantha-related content.

This visibility engine should remain consistent across all JiNANAM modules.

 

**Priority 3 – Location-Based Feed**

Once the above priorities are exhausted, the system should prioritize content based on the member's geographic location.

The system should first display content within the member's immediate area.

Feed Expansion Logic:

Area

↓

5 KM Radius

↓

10 KM Radius

↓

20 KM Radius

↓

City

↓

District

↓

State

↓

Country

↓

Global

As the member continues scrolling, the search radius should automatically expand while still respecting the Community Visibility Engine.

 

**Priority 4 – Global JiNANAM Feed**

If no additional local content is available, the member should receive:

  - National Jain News
  - Global Jain Community Updates
  - JiNANAM Official Announcements
  - Featured Temples
  - Featured Events
  - Featured Tours
  - Featured Offers

 

**2. Automatic Feed Generation**

The Community Feed should automatically generate feed cards whenever content is created anywhere in the platform.

Whenever an admin creates or updates any of the following:

  - Events
  - Tours
  - Offers & Benefits
  - Notices
  - Temple Updates
  - Jain Centre Updates
  - Monk Updates
  - Dharamshala Updates
  - Photo Gallery
  - Community page
  - Important Announcements

  

The system should automatically generate a corresponding Community Feed post.

This eliminates duplicate work for admins and keeps the feed continuously updated.

 

**3. Manual Feed Posts**

Apart from automatic feed generation, authorized admins should be able to publish manual feed posts.

Supported users:

  - Super Admin
  - Temple Admin
  - Jain Centre Admin
  - Dharamshala Admin
  - Community page
  - Monk Admin (if applicable)

Each admin should only be able to publish content related to their own organization.

 

**4. Feed Creation**

Each feed post should support:

  - Title
  - Description
  - Cover Image
  - Images (max 5)
  - PDF Attachment
  - External Website Link
  - Category
  - Start Date
  - End Date

Posts should automatically become active and inactive based on the configured dates. Dates should not be visible to the members.

 

**5. Feed Categories**

Every feed post should belong to one category.

Suggested Categories:

  - Temple Updates
  - Jain Centre Updates
  - Monk Updates
  - Dharamshala Updates
  - Events
  - Tours
  - Notices
  - Spiritual Articles
  - Photos
  - Videos
  - Offers & Benefits
  - JiNANAM Announcements
  - Other

Categories should be managed by the Super Admin.

 

**6. Feed Visibility Engine**

Every feed post should follow the JiNANAM Visibility Engine.

Visibility should support:

**Geographic Visibility**

  - Country
  - State
  - District
  - City
  - Area
  - GPS Radius

 

**Community Visibility**

  - Digambar
  - Shwetambar

If Digambar

↓

Configured Sub Community

If Shwetambar

↓

Murtipujak

↓

Configured Gaccha

The system should only display content to eligible members.

 

**7. Feed Ranking Logic**

The system should intelligently rank feed posts.

Recommended Priority Score:

  - Followed Temple = Highest
  - Followed Monk = Highest
  - Followed Jain Centre = Highest
  - Followed Dharamshala = Highest
  - Community Match
  - Same Area
  - Same City
  - Same District
  - Same State
  - Same Country
  - Global
  - JiNANAM Official

If multiple posts have equal priority, the latest post should appear first.

 

**8. Feed Display (Member App)**

The Community Feed should be displayed as an attractive scrolling timeline.

Each feed card should display:

  - Cover Image
  - Title
  - Short Description
  - Organization Name
  - Category
  - Date & Time
  - Share Button
  - Bookmark Button

Where applicable, display action buttons such as:

  - View Event
  - Book Now
  - Donate
  - Register
  - View Details

 

**9. Pinned Posts**

The Super Admin should have the ability to pin important announcements globally.

Each Temple Admin, Jain Centre Admin, Dharamshala Admin, and Monk Admin should be able to pin one important post for their own profile.

Pinned posts should always appear at the top for eligible members.

 

**10. Advertisements**

The Community Feed should support advertisement placements.

Advertisement management should be available only to the Super Admin.

Advertisement Types:

  - Banner Image
  - Video
  - Promotional Card

Advertisement placement should automatically appear after every **7 feed posts**.

The advertisement should follow the same Visibility Engine as the feed.

Advertisements should support:

  - Start Date
  - End Date
  - Geographic Visibility
  - Click Redirect URL

 

**11. Feed Search**

Members should be able to search feed posts using:

  - Temple Name
  - Jain Centre Name
  - Monk Name
  - Event Name
  - Category
  - Keywords

Search results should update instantly.

 

**12. Feed Filters**

Members should be able to filter the Community Feed by:

  - My Temples
  - My Jain Centres
  - My Monks
  - Nearby
  - My Community
  - Events
  - Tours
  - Notices
  - Offers & Benefits
  - Temple Updates
  - Videos
  - Photos

Multiple filters should work together.

 

**13. Bookmark Feed**

Members should be able to bookmark feed posts.

Bookmarked posts should be available under:

**Saved Feed**

Members may remove saved posts at any time.

 

**14. Share Feed**

Members should be able to share feed posts through:

  - WhatsApp
  - Facebook
  - Instagram
  - Telegram
  - Copy Link

All shared links should use JiNANAM Deep Linking.

If the JiNANAM App is installed:

Open the feed directly.

Otherwise:

Redirect to the Play Store/App Store and open the feed after installation.

 

**15. Feed Analytics**

The system should automatically track:

  - Total Views
  - Total Shares
  - Total Bookmarks
  - Link Clicks
  - Reach

Analytics should be available only to the respective Admin and Super Admin.

 

**16. Notifications**

Whenever a new feed post becomes active:

Eligible members should receive notifications based on:

  - Followed Entities
  - Community Visibility
  - Geographic Visibility

Notifications should be delivered through:

  - Push Notification
  - In-App Notification
  - Email (where applicable)

 

**17. Feed Archive**

Once the configured End Date is reached:

The feed post should automatically become inactive.

Inactive posts should remain archived for future reference and reports.

No feed post should be permanently deleted unless performed by the Super Admin.

 

**18. Reports**

Admins should be able to download:

  - Feed Performance Report
  - View Analytics
  - Share Analytics
  - Bookmark Analytics
  - Feed Reach Report
  - Category-wise Report
  - City-wise Report
  - Community-wise Report

Export Options:

  - PDF
  - Excel
  - CSV

 

**19. Business Rules**

  - The Community Feed should always prioritize followed entities over all other content.
  - The JiNANAM Community Visibility Engine should be applied before displaying any community-specific content.
  - The feed should gradually expand geographically as the member scrolls further down the feed.
  - Manual feed creation should be restricted to authorized admins only.
  - Events, Tours, Offers, Notices, Temple Updates, Jain Centre Updates, Monk Updates, and Dharamshala Updates should automatically generate Community Feed posts.
  - Members should not be able to create, edit, or delete feed posts.
  - Members should be able to bookmark and share feed posts.
  - Community feed posts should automatically become inactive after the configured end date.
  - Feed history should remain permanently archived for reporting purposes.
  - Advertisements should only be managed by the Super Admin and should automatically appear after every **7 feed posts**.

 

**20. Future Ready**

The Community Feed should be designed to support future enhancements without redevelopment, including:

  - AI-Based Feed Personalization
  - Trending Topics
  - Festival Highlights
  - Live Pravachan Streaming
  - Live Event Updates
  - Poll Integration
  - Podcast & Audio Content
  - Sponsored Feed Campaigns
  - Personalized Recommendations
  - Regional Content Prioritization

 

**Final Note**

The Community Feed should serve as the central communication hub of the JiNANAM platform by intelligently combining updates from Temples, Jain Centres, Monks, Dharamshalas, Events, Tours, Offers & Benefits, Notices, and Official JiNANAM announcements. It should provide every member with a personalized, community-aware, and location-based experience while minimizing manual effort for administrators through automatic feed generation and smart content prioritization.  

# Visitor Management  

# **Visitor Management Module**

# **1. Module Overview**

## **1.1 Module Name**

**Visitor Management**

  

## **1.2 Purpose**

The Visitor Management System enables every temple using the JiNANAM platform to digitally record and manage every visitor entering and exiting the premises.

The objective is to eliminate manual visitor registers while maintaining complete records of visitors, vehicles, visit duration, and member movements.

The system should be simple enough for security personnel to use while providing detailed insights and reports to Temple Administrators.

The module must also integrate seamlessly with JiNANAM Member Profiles, allowing automatic data retrieval, reducing manual data entry, improving security, and maintaining accurate visitor records.

The Visitor Management module should be designed as a reusable module so that it can later be deployed across:

  - Temples
  - Dharamshalas
  - Jain Centres
  - Community Halls
  - Trust Offices
  - Any future JiNANAM managed location

without requiring redevelopment.

  

# **2. Business Objectives**

The primary objectives of this module are:

### **Digital Visitor Register**

Replace manual visitor registers with a centralized digital visitor management system.

  

### **Faster Visitor Entry**

Reduce visitor check-in time through:

  - JiNANAM Member ID
  - QR Code Scanning
  - Automatic member information retrieval

  

### **Better Security**

Maintain complete entry and exit records for:

  - Visitors
  - Vehicles
  - Stay duration
  - Visit history

  

### **Member Experience**

Allow JiNANAM Members to receive automatic notifications whenever they check into or check out from a temple.

  

### **Temple Analytics**

Provide temple administrators with complete reports regarding:

  - Daily visitors
  - Peak hours
  - Repeat visitors
  - Vehicles
  - Visitor demographics
  - Average visit duration

  

### **Privacy Protection**

Security personnel should never have access to confidential member information.

Only the information required to verify visitor identity should be displayed.

  

# **3. Users & Roles**

The Visitor Management module consists of three different user types.

## **3.1 Security Guard**

Platform:

Android Visitor App

Responsibilities:

  - Check In visitors
  - Check Out visitors
  - Scan QR Codes
  - Enter Member ID manually
  - Enter vehicle details
  - Register manual visitors
  - Capture visitor photos (where applicable)

Restrictions:

Security personnel cannot:

  - Edit member profiles
  - View confidential member information
  - Access reports
  - Delete visitor records
  - View vehicle history
  - Modify completed entries

  

## **3.2 Temple Administrator**

Platform:

Web Portal

Responsibilities:

  - View all visitor records
  - Search visitor history
  - View vehicle history
  - Generate reports
  - Monitor live visitors
  - Configure visitor settings
  - View dashboard
  - Export reports

Temple Admin can access complete visitor information.

  

## **3.3 JiNANAM Member**

Platform:

JiNANAM Mobile Application

Members cannot create visitor entries.

They can:

  - Receive Check In notifications
  - Receive Check Out notifications
  - View visit history
  - View visit duration
  - View vehicle used during visit

  

# **4. Platform Architecture**

The Visitor Management System consists of three applications working together.

## **Android Visitor App**

Used by:

Security Guard

Purpose:

Fast visitor entry and exit.

Primary Features:

  - QR Scanner
  - Member ID Entry
  - Visitor Registration
  - Vehicle Entry
  - Check In
  - Check Out

  

## **Admin Web Portal**

Used by:

Temple Administrator

Purpose:

Monitoring, reports and visitor management.

Primary Features:

  - Dashboard
  - Reports
  - Vehicle History
  - Live Visitors
  - Search
  - Analytics

  

## **JiNANAM Member App**

Used by:

Registered JiNANAM Members

Purpose:

Receive notifications and maintain visit history.

Primary Features:

  - Visit History
  - Check In Notification
  - Check Out Notification

  

# **5. Complete Business Workflow**

## **Step 1**

Visitor arrives at Temple Entrance.

↓

Security opens the Visitor Management Android App.

↓

System displays:

**New Entry**

or

**Existing Entry (Check Out)**

  

## **Step 2**

Security asks the visitor:

"Do you have a JiNANAM Member ID or QR Code?"

Two possible flows exist.

### **Flow A**

Visitor shows QR Code.

Security scans QR.

System automatically fetches member information.

  

### **Flow B**

Visitor provides JiNANAM Member ID.

Security enters Member ID manually.

System automatically fetches member information.

  

### **Flow C**

Visitor is not a JiNANAM Member.

Security selects:

Manual Visitor

and enters visitor information manually.

  

# **6. Android Security App (Screen-wise Functional Flow)**

## **6.1 Purpose**

The Android Security App is designed specifically for security personnel stationed at the entrance gate.

The application must provide the fastest possible visitor check-in and check-out process with minimal data entry while ensuring visitor records are accurately maintained.

The interface should be optimized for tablets and Android phones with large buttons, minimal typing, QR scanning support, and offline capability.

  

# **6.2 Login Screen**

### **Purpose**

Authenticate the Security Guard before allowing access.

### **Login Options**

  - Mobile Number + OTP
  - Mobile Number + Password

### **Fields**

  - Mobile Number
  - OTP / Password

### **Validation**

  - Mobile number must be registered by Temple Admin.
  - Security users cannot self-register.
  - Login credentials are managed by Temple Admin.

### **Successful Login**

Redirect to:

**Visitor Dashboard**

  

# **6.3 Visitor Dashboard**

The dashboard should be simple and optimized for quick operations.

### **Dashboard Cards**

  - Visitors Currently Inside
  - Vehicles Currently Inside
  - Today's Check-Ins
  - Today's Check-Outs

### **Primary Buttons**

  - New Check-In
  - Check-Out
  - Search Visitor

  

# **6.4 New Visitor Check-In Flow**

When security selects **New Check-In**, the system should ask:

### **Visitor Type**

  - JiNANAM Member
  - Manual Visitor

  

## **Flow A – JiNANAM Member**

### **Step 1**

Identify the member using either:

  - Scan JiNANAM QR Code  
     OR
  - Enter JiNANAM Member ID manually

  

### **Step 2**

System fetches member details automatically.

Security should only be able to view:

  - Profile Photo
  - Member Name
  - Address
  - Member Verified Status

The following information should remain hidden:

  - Mobile Number
  - Email
  - Date of Birth
  - Donations
  - Membership History
  - Other personal details

  

### **Step 3**

Security enters:

Vehicle Number

Vehicle Type

  - Car
  - Bike
  - Auto
  - Bus
  - Taxi
  - Other

Visit Type

  - Day Visit
  - Stay

Number of Visitors

OR

Multiple Member IDs

Business Rule:

If multiple JiNANAM members are travelling together in one vehicle, the security guard should have the option to add multiple Member IDs under the same vehicle entry.

If Member IDs are not available for all passengers, security may simply enter the total number of visitors.

  

### **Step 4**

System Validation

Before creating the entry, the system should verify:

  - Member exists.
  - Member is active.
  - Vehicle is not already checked in.
  - QR Code is valid.
  - Member ID is valid.

If validation passes,

Create Entry.

Generate unique Entry ID.

Record:

  - Check-In Time
  - Security User
  - Temple
  - Vehicle Details

  

### **Step 5**

Automatic Actions

System should immediately:

  - Mark visitor as Inside.
  - Add vehicle to Active Vehicles.
  - Update Dashboard.
  - Update Temple Admin Dashboard.
  - Send notification to Member App.
  - Store visit in history.

  

## **Flow B – Manual Visitor**

If visitor is not a JiNANAM Member.

Security selects

Manual Visitor.

Fields displayed:

Visitor Category

  - Non Member
  - VIP
  - Vendor
  - Contractor
  - Staff
  - Delivery
  - Unknown Visitor
  - Others

Visitor Name

Mobile Number (optional)

Address

City

State

Pincode

Vehicle Number

Vehicle Type

Visit Type

Number of Visitors

Visitor Photo (optional)

Photo upload should only be available for:

  - Vendor
  - Contractor
  - Unknown Visitor
  - Others

Photo should not be mandatory.

  

# **6.5 Check-Out Flow**

Security selects

Check-Out.

System should allow search using:

  - Member ID
  - QR Scan
  - Entry ID
  - Vehicle Number

System displays:

  - Visitor Name
  - Vehicle Number
  - Check-In Time
  - Duration
  - Entry ID

Security simply presses

**OUT**

System automatically:

  - Records Check-Out Time
  - Calculates Visit Duration
  - Frees Vehicle
  - Removes Visitor from Current Visitors
  - Updates Dashboard
  - Sends Member Notification
  - Saves Visit History

No additional confirmation screen should be required.

  

# **6.6 Offline Mode**

The Android Security App must continue functioning without internet connectivity.

### **During Offline Mode**

Security should still be able to:

  - Check In Visitors
  - Check Out Visitors
  - Scan QR Codes
  - Search locally stored active entries

All records should be stored securely within the device.

### **Synchronization**

Once internet connectivity is restored:

The application should automatically synchronize:

  - Check-In Records
  - Check-Out Records
  - New Manual Visitors
  - Vehicle Records

If synchronization fails,

The system should retry automatically until successful.

Temple Admin should receive synchronized data without duplication.

  

# **7. Temple Admin Web Portal**

## **7.1 Purpose**

The Temple Admin Portal acts as the central monitoring and reporting platform for visitor management.

Unlike the Security App, this portal focuses on analytics, monitoring, reports, search, and operational control.

Temple Admin should have complete visibility of all visitor activities for their temple.

  

## **7.2 Visitor Dashboard**

The dashboard should provide a real-time overview of visitor activity.

### **Summary Cards**

  - Visitors Currently Inside
  - Vehicles Currently Inside
  - Today's Check-Ins
  - Today's Check-Outs
  - Average Visit Duration
  - Peak Visiting Hour
  - Repeat Visitors

  

### **Live Visitor Table**

Display all visitors currently inside the premises.

Columns

  - Entry ID
  - Member Name / Visitor Name
  - Vehicle Number
  - Vehicle Type
  - Visit Type
  - Check-In Time
  - Current Duration
  - Status

Temple Admin should be able to sort and filter this table.

  

### **Recent Activity Panel**

Display latest visitor movements.

Examples:

  - Member Checked In
  - Visitor Checked Out
  - VIP Arrived
  - Vehicle Still Inside

Display newest activity first.

  

# **8. JiNANAM Member App Flow**

The JiNANAM Member App is not used for visitor entry.

Its purpose is to keep members informed about their visits and provide transparency.

  

## **My Temple Visits**

A dedicated menu should be available:

**My Temple Visits**

Display:

  - Temple Name
  - Check-In Date
  - Check-In Time
  - Check-Out Time
  - Duration
  - Vehicle Number
  - Number of Visitors
  - Visit Type
  - Entry ID

Newest visit should appear first.

Members should be able to view their complete visit history.

  

## **Notifications**

Upon Check-In:

The member receives an instant notification.

Example:

**Checked In Successfully**

You have been checked into **Shree Adinath Jain Temple**.

Vehicle: MH02AB1234

Visitors: 4

Time: 10:12 AM

  

Upon Check-Out:

Example:

**Checked Out Successfully**

Temple: Shree Adinath Jain Temple

Duration: 2 Hours 35 Minutes

Thank you for visiting.

  

# **9. Database Fields & Data Model**

The Visitor Entry entity should store at minimum:

### **Entry Information**

  - Entry ID (System Generated)
  - Temple ID
  - Security User ID
  - Entry Date
  - Check-In Time
  - Check-Out Time
  - Visit Duration
  - Visit Status (Inside / Checked Out)

### **Visitor Information**

  - Visitor Type
  - JiNANAM Member ID (if applicable)
  - Visitor Name
  - Address
  - Area
  - City
  - State
  - Pincode
  - Number of Visitors

### **Vehicle Information**

  - Vehicle Number
  - Vehicle Type

### **Visit Information**

  - Visit Type (Day Visit / Stay)
  - Visitor Category
  - Visitor Photo (if applicable)

### **Audit Information**

  - Created By
  - Updated By
  - Device ID
  - Sync Status
  - Last Modified Timestamp

  

# **10. Validation Rules**

The system should enforce the following validations:

### **Member Validation**

  - Member ID must exist.
  - QR Code must belong to a valid JiNANAM Member.
  - Inactive members should not be allowed for automatic verification.

### **Vehicle Validation**

  - Vehicle Number is mandatory.
  - Duplicate active vehicle entries are not permitted.
  - A vehicle must be checked out before another check-in is allowed.

### **Visit Validation**

  - Visit Type is mandatory.
  - Vehicle Type is mandatory.
  - Number of Visitors must be at least one.
  - Entry ID must be unique.

### **Manual Visitor Validation**

  - Visitor Name is mandatory.
  - Visitor Category is mandatory.
  - Visitor Photo is required only if configured by the Temple Admin for specific visitor categories (optional feature).

### **Offline Validation**

  - Offline entries must receive temporary local IDs.
  - After synchronization, temporary IDs should be replaced with permanent Entry IDs without data duplication.

  

# **11. Business Rules**

The following business rules govern how the Visitor Management module should function across the JiNANAM ecosystem.

  

## **11.1 Visitor Entry Rules**

### **Rule 1 – Every visitor must have an active entry.**

Every visitor entering the premises must have a visitor entry created in the system before they are allowed to enter.

No visitor should remain inside the premises without an active check-in record.

  

### **Rule 2 – JiNANAM Member Identification**

A JiNANAM Member can be identified using either:

  - QR Code Scan
  - JiNANAM Member ID

Both methods should retrieve the same member information.

  

### **Rule 3 – Automatic Member Data Fetch**

Once a valid Member ID or QR Code is scanned, the system should automatically retrieve all available member details from the JiNANAM database.

Security personnel should not manually enter member information.

  

### **Rule 4 – Security Privacy Restrictions**

Security users should only be able to view:

  - Member Name
  - Profile Photo
  - Address
  - Membership Verification Status

All other personal information must remain hidden.

  

### **Rule 5 – Vehicle Entry**

Every visitor entry must include:

  - Vehicle Number
  - Vehicle Type

Vehicle Number is mandatory.

  

### **Rule 6 – Duplicate Vehicle Prevention**

If a vehicle is already checked in:

The system should not allow another active entry for the same vehicle.

Display message:

This vehicle is already inside the premises. Please complete Check-Out before creating a new Check-In.

  

### **Rule 7 – Multiple JiNANAM Members**

One vehicle can contain multiple JiNANAM Members.

Security should be able to:

  - Add multiple Member IDs

OR

  - Add one Member ID and specify total visitor count.

  

### **Rule 8 – Manual Visitor Categories**

If visitor is not registered on JiNANAM,

Security should register the visitor manually.

Supported categories:

  - Non Member
  - VIP
  - Vendor
  - Contractor
  - Staff
  - Delivery
  - Unknown Visitor
  - Others

  

### **Rule 9 – Visit Type**

Visit Type should be mandatory.

Options:

  - Day Visit
  - Stay

Business Logic:

**Day Visit**

Stay duration monitoring enabled.

**Stay**

Long stay alerts disabled.

  

### **Rule 10 – Check-Out**

Security only needs to press:

OUT

Everything else should happen automatically.

  

### **Rule 11 – Entry Completion**

Once Check-Out is completed:

System should:

  - Calculate duration
  - Free vehicle
  - Move record to history
  - Update dashboard
  - Send notifications

  

# **12. Notification Trigger Matrix**

The Visitor Management System should automatically generate notifications based on predefined system events.

  

## **12.1 JiNANAM Member Notifications**

### **Trigger**

Visitor successfully checked in.

Recipient

JiNANAM Member

Notification

**Temple Check-In**

Message

"You have successfully checked in to **{Temple Name}**."

Details:

  - Entry Time
  - Vehicle Number
  - Number of Visitors

  

### **Trigger**

Visitor successfully checked out.

Recipient

JiNANAM Member

Notification

**Temple Check-Out**

Message

"You have successfully checked out from **{Temple Name}**."

Display:

  - Check-In Time
  - Check-Out Time
  - Total Duration
  - Vehicle Number

  

## **12.2 Temple Admin Notifications**

### **Trigger**

Long Stay (Only Day Visit)

Condition

Visitor remains inside beyond configurable duration.

Example:

12 Hours

Notification

"Visitor has been inside the premises for over 12 hours."

  

### **Trigger**

Offline Sync Failure

Condition

Security App fails to synchronize records.

Notification

"Visitor records pending synchronization."

  

### **Trigger**

Manual Visitor Added

Optional notification.

Can be enabled or disabled in settings.

  

## **12.3 Security Notifications**

Examples:

  - Entry Saved Successfully
  - Check-Out Successful
  - Offline Mode Activated
  - Synchronization Completed

  

# **13. Dashboard Requirements**

The Temple Administrator Dashboard should provide a real-time operational overview.

  

## **Dashboard Summary Cards**

Display:

  - Visitors Currently Inside
  - Vehicles Currently Inside
  - Today's Check-Ins
  - Today's Check-Outs
  - Average Visit Duration
  - Peak Visiting Hour
  - Repeat Visitors

  

## **Current Visitors**

Live table displaying visitors currently inside.

Columns:

  - Entry ID
  - Member Name
  - Vehicle Number
  - Vehicle Type
  - Visit Type
  - Check-In Time
  - Current Duration
  - Status

  

## **Recent Activity**

Display latest activities.

Examples:

  - Check-In
  - Check-Out
  - Manual Visitor Added
  - Vehicle Exited

  

## **Visitor Trend**

Simple graphical representation of:

  - Daily Visitors
  - Weekly Visitors
  - Monthly Visitors

  

## **Quick Actions**

Temple Admin should be able to:

  - Search Visitor
  - Search Vehicle
  - Export Reports
  - View Current Visitors

  

# **14. Reports**

Temple Administrators should have access to comprehensive visitor reports.

  

## **Visitor Report**

Columns:

  - Entry ID
  - Member Name
  - Visitor Category
  - Vehicle Number
  - Visit Type
  - Check-In
  - Check-Out
  - Duration

  

## **Vehicle Report**

Display:

  - Vehicle Number
  - Total Visits
  - Last Visit
  - Average Stay Duration
  - Linked Members

  

## **Member Visit Report**

Display:

  - Member Name
  - Member ID
  - Total Visits
  - Last Visit
  - Average Stay

  

## **Area Report**

Visitors grouped by:

  - Area
  - City
  - State
  - Pincode

Useful for visitor analytics.

  

## **Repeat Visitor Report**

Display visitors based on frequency.

Useful for identifying regular devotees.

  

## **Current Visitors Report**

Display everyone currently inside.

Useful during festivals and emergencies.

  

## **Export Options**

Temple Admin should be able to export reports as:

  - PDF
  - Excel (XLSX)
  - CSV

  

# **15. Search & Filters**

The Visitor Management module should support quick and advanced search capabilities.

  

## **Global Search**

Priority search should be:

  - JiNANAM Member ID

Additional searches:

  - Entry ID
  - Vehicle Number

  

## **Filters**

Temple Admin should be able to filter visitor records by:

### **Date Range**

  - Today
  - Yesterday
  - This Week
  - This Month
  - Custom Range

  

### **Visitor Type**

  - JiNANAM Member
  - Manual Visitor

  

### **Visitor Category**

  - Non Member
  - VIP
  - Vendor
  - Contractor
  - Staff
  - Delivery
  - Unknown Visitor
  - Others

  

### **Visit Type**

  - Day Visit
  - Stay

  

### **Vehicle Type**

  - Car
  - Bike
  - Auto
  - Bus
  - Taxi
  - Other

  

### **Visit Status**

  - Currently Inside
  - Checked Out

  

### **Member Verification**

  - Verified JiNANAM Member
  - Manual Visitor

  

## **Search Results**

Each result should display:

  - Entry ID
  - Member Name
  - Vehicle Number
  - Check-In Time
  - Check-Out Time
  - Duration
  - Current Status

Search results should support:

  - Sorting
  - Pagination
  - Export

  

# **16. Roles & Permissions Matrix**

The Visitor Management module will operate under Role-Based Access Control (RBAC). Each user role will have predefined permissions to ensure security and accountability.

|  |  |  |  |  |
| :-: | :-: | :-: | :-: | :-: |
| **Function** | **Super Admin** | **Temple Admin** | **Security Guard** | **JiNANAM Member** |
| View Dashboard | ✅ | ✅ | Limited | ❌ |
| Create Visitor Entry | ✅ | ✅ | ✅ | ❌ |
| Check-In Visitor | ✅ | ✅ | ✅ | ❌ |
| Check-Out Visitor | ✅ | ✅ | ✅ | ❌ |
| Scan QR Code | ❌ | ❌ | ✅ | ❌ |
| Search Member by ID | ✅ | ✅ | ✅ | ❌ |
| View Full Member Details | ✅ | ✅ | ❌ | Own Profile Only |
| View Visitor History | ✅ | ✅ | Limited (Today's Entries Only) | Own Visits Only |
| View Vehicle History | ✅ | ✅ | ❌ | ❌ |
| Edit Visitor Entry | ✅ | ✅ (Before Check-Out) | ❌ | ❌ |
| Delete Visitor Entry | ✅ | ❌ | ❌ | ❌ |
| Export Reports | ✅ | ✅ | ❌ | ❌ |
| Configure Visitor Settings | ✅ | ✅ | ❌ | ❌ |
| Manage Security Users | ✅ | ✅ | ❌ | ❌ |

### **Security Restrictions**

Security Guards **must not** be able to:

  - View donor information
  - View member contact details
  - Edit JiNANAM member profiles
  - View historical analytics
  - Export reports
  - Delete or modify completed visitor entries

All actions performed by Security Guards must be logged in the Audit Log.

  

# **17. Offline Synchronization Logic**

Since temple entrances may occasionally experience internet outages, the Android Security App must support offline operation.

## **17.1 Offline Behaviour**

When the device is offline:

Security should still be able to:

  - Create visitor check-ins
  - Complete check-outs
  - Scan JiNANAM QR Codes (using locally cached verification data where available)
  - Search active visitors already stored on the device

Each offline record should be assigned a **Temporary Local Entry ID**.

Example:

TEMP-20260701-00045

These temporary IDs are only used on the device until synchronization is complete.

  

## **17.2 Automatic Synchronization**

Once internet connectivity is restored, the application should automatically:

1.  Detect network availability.
2.  Upload all pending records in chronological order.
3.  Receive permanent Entry IDs from the server.
4.  Replace temporary IDs with server-generated Entry IDs.
5.  Update dashboards and reports.
6.  Deliver any pending notifications that could not be sent while offline.

Synchronization should happen in the background without user intervention.

  

## **17.3 Synchronization Failure**

If synchronization fails:

  - The app should retry automatically at configurable intervals.
  - Records must never be deleted until successful synchronization.
  - Temple Admin should receive a system alert indicating that records are pending sync.

  

# **18. Edge Cases & Exception Handling**

The system should gracefully handle unexpected situations.

### **Member Not Found**

  - Display: "JiNANAM Member not found."
  - Allow Security to proceed using Manual Visitor flow.

  

### **Invalid QR Code**

  - Display: "Invalid or expired QR Code."
  - Allow manual Member ID entry.

  

### **Duplicate Vehicle Entry**

  - Prevent check-in.
  - Display: "This vehicle is already inside the premises. Please complete Check-Out before creating a new Check-In."

  

### **Duplicate Member Entry**

If the same JiNANAM Member is already marked as inside:

  - Warn the Security Guard.
  - Do not allow a second active entry.

  

### **Check-Out Without Check-In**

  - Do not allow check-out.
  - Display: "No active visitor record found."

  

### **Member Arrives Without Vehicle**

Some visitors may arrive on foot or by public transport.

Allow Vehicle Number to be marked as:

  - Walk-In
  - No Vehicle

Vehicle Type should automatically be set to **Other**.

  

### **Manual Visitor Forgets Details**

If complete address information is unavailable:

  - Allow minimal mandatory information (Name + Visitor Category + Visit Type).
  - Mark record as "Incomplete Information."

  

### **Device Battery Dies During Entry**

Partially completed forms should auto-save locally and reopen when the app restarts.

  

### **App Crash During Entry**

The system should restore the last unsaved visitor entry after relaunch.

  

### **QR Scan Failure**

Provide an immediate option to switch to manual Member ID entry.

  

### **Temple Changes Settings**

Any changes to visitor settings should apply only to new visitor entries. Existing records must remain unchanged.

  

# **19. Future Enhancements**

The Visitor Management module should be designed with scalability in mind.

The following enhancements are planned for future phases:

## **AI-Based Visitor Insights**

  - Predict peak visiting days and hours.
  - Visitor trend analysis.
  - Seasonal visit patterns.

  

## **ANPR (Automatic Number Plate Recognition)**

  - Automatically detect vehicle number plates using cameras.
  - Eliminate manual vehicle number entry.

  

## **Facial Recognition (Optional)**

  - Recognize registered staff or vendors.
  - Accelerate entry process.

  

## **Smart Gate Integration**

  - Automatic boom barrier opening after successful verification.
  - RFID or QR-based vehicle access.

  

## **Self Check-In Kiosk**

  - Visitors scan their JiNANAM QR Code at a kiosk.
  - System completes check-in automatically.
  - Security only verifies the visitor if required.

  

## **Visitor Appointment System**

  - Temple staff can schedule expected visitors.
  - Faster approval and entry.

  

## **Universal Visitor Management**

The module should support use across:

  - Temples
  - Dharamshalas
  - Jain Centres
  - Community Halls
  - Trust Offices
  - Future JiNANAM-managed facilities

without requiring redevelopment.

  

# **20. Acceptance Criteria**

The Visitor Management module will be considered complete only when all of the following conditions are satisfied.

## **Functional Acceptance**

  - Security Guard can successfully check in JiNANAM Members using Member ID or QR Code.
  - Manual Visitors can be registered without errors.
  - Duplicate vehicle entries are prevented.
  - Check-out updates visitor status correctly.
  - Entry IDs are generated uniquely.
  - Notifications are delivered successfully.
  - Dashboard statistics update in real time.
  - Reports generate accurately with correct filters.
  - Search by Member ID, Vehicle Number, and Entry ID functions correctly.

  

## **Performance Acceptance**

  - QR Code scanning completes within 2 seconds under normal network conditions.
  - Visitor check-in process completes within 10 seconds for JiNANAM Members.
  - Dashboard loads within 3 seconds.
  - Search results return within 2 seconds.

  

## **Security Acceptance**

  - Security Guards cannot access restricted member information.
  - All actions are recorded in Audit Logs.
  - Role-based permissions are strictly enforced.
  - Visitor data is transmitted securely.

  

## **Offline Acceptance**

  - Visitor entries can be created without internet connectivity.
  - Data synchronizes automatically once the internet is restored.
  - No duplicate records are created after synchronization.

  

## **User Experience Acceptance**

  - Visitor check-in process requires minimal manual data entry.
  - Interface is simple enough for non-technical security personnel.
  - Buttons and actions are clearly labeled.
  - Error messages are user-friendly and actionable.

  
  

# Staff Management  

**Module: Staff Management**

 

**1. Staff Dashboard**

The Staff Management module should be accessible only to the respective Temple, Dharamshala, Jain Centre, or Bhojanalay Admin based on their permissions. Each admin should only be able to manage staff belonging to their organization.

The dashboard should display:

  - Total Staff
  - Active Staff
  - Inactive Staff
  - Staff Present Today
  - Staff Absent Today
  - Staff on Leave
  - Staff Yet to Check Out
  - New Staff Added This Month
  - Documents Expiring Soon

Quick Actions:

  - Add Staff
  - View Staff
  - Mark Attendance
  - Approve Leave
  - Download Reports

 

**2. Staff Registration**

Every staff member should be registered only once.

The system should automatically generate a unique Staff ID.

Example:

**JFST01**

The Staff ID should appear on:

  - Staff Profile
  - QR Code
  - Reports
  - Search Results

 

**Staff Registration Form**

The admin should capture the following information.

**Personal Details**

  - Staff Name
  - Profile Photo
  - Date of Birth
  - Gender
  - Mobile Number
  - Email (Optional)
  - Aadhaar Number
  - PAN Number

 

**Address**

**Current Address**

  - Address
  - Area
  - City
  - State
  - Country
  - Pincode

**Permanent Address**

  - Address
  - Area
  - City
  - State
  - Country
  - Pincode

Option:

☐ Same as Current Address

 

**Staff Category**

Select one:

  - Temple Staff
  - Dharamshala Staff
  - Bhojanshala Staff
  - Security Guard
  - Housekeeping
  - Poojari
  - Manager
  - Office Staff
  - Maintenance
  - Driver
  - Gardener
  - Electrician
  - Plumber
  - Volunteer Staff
  - Other

If **Other** is selected,

Display:

**Please Specify**

(Text Box)

**Employment Information**

  - Joining Date
  - Department
  - Designation
  - Reporting To
  - Employment Status

Status Options:

  - Active
  - Inactive
  - Resigned
  - Terminated
  - Retired

 

**3. Emergency Information**

Every staff member should have emergency contact details.

Fields:

  - Emergency Contact Name
  - Relationship
  - Mobile Number
  - Blood Group
  - Medical Conditions
  - Allergies

This information should be visible only to authorized admins.

 

**4. Staff Documents**

Admins should be able to upload and manage staff documents.

Supported Documents:

  - Aadhaar
  - PAN
  - Driving Licence
  - Police Verification
  - Employment Agreement
  - Medical Certificate
  - Other Documents

Each uploaded document should include:

  - Document Name
  - Upload Date
  - Expiry Date (Optional)
  - Download Option

Admins should also be able to replace expired documents while preserving document history.

 

**5. Staff QR Code**

After successful registration, the system should automatically generate a unique QR Code for every staff member.

The QR Code should contain:

  - Staff ID
  - Staff Name
  - Organization
  - Unique Verification Token

The QR Code should be:

  - Downloadable
  - Shareable
  - Printable

The QR should also be available within the staff profile at all times.

 

**6. QR-Based Entry & Exit**

Every time a staff member enters or exits the premises, the QR Code should be scanned by Security.

**Check-In Flow**

Staff arrives

↓

Security scans QR

↓

System records:

  - Date
  - Check-In Time
  - Security User
  - Location

↓

Status:

**Inside**

 

**Check-Out Flow**

Security scans the same QR again

↓

System records:

  - Check-Out Time
  - Working Hours

↓

Status:

**Checked Out**

 

**QR Search Alternative**

If the QR Code is unavailable or damaged,

Security should be able to search using:

  - Staff ID
  - Staff Name

and complete the check-in/check-out process.

 

**7. Attendance Management**

The system should support both automatic and manual attendance.

 

**Option 1 – QR Attendance**

Attendance is automatically recorded when the QR Code is scanned.

The system should calculate:

  - Check-In Time
  - Check-Out Time
  - Total Working Hours

 

**Option 2 – Manual Attendance**

The admin should also have the option to manually mark attendance.

Attendance options:

  - Full Day
  - Half Day
  - Absent
  - Leave
  - Holiday

Manual attendance should override QR attendance if updated by the admin.

 

**8. Leave Management**

Admins should be able to manually add or approve leave requests.

Leave Types:

  - Casual Leave
  - Sick Leave
  - Paid Leave
  - Unpaid Leave
  - Emergency Leave

Each leave record should contain:

  - Leave Type
  - Start Date
  - End Date
  - Reason
  - Status
      
      - Pending
      - Approved
      - Rejected

Complete leave history should be maintained for every staff member.

 

**9. Working Hours Configuration**

Each organization should be able to configure standard working hours.

Example:

Working Hours:

9:00 AM – 6:00 PM

Late Arrival:

After 9:30 AM

Early Exit:

Before 5:30 PM

These settings should be configurable by the admin and used only for reporting purposes.

 

**10. Staff Profile**

Every staff member should have a complete profile.

Sections:

  - Personal Information
  - Employment Information
  - QR Code
  - Attendance History
  - Leave History
  - Documents
  - Emergency Details
  - Activity History

The profile should remain available even if the staff member becomes inactive.

 

**11. Attendance History**

The system should maintain complete attendance records.

Display:

  - Date
  - Check-In Time
  - Check-Out Time
  - Total Working Hours
  - Attendance Status

Filters:

  - Today
  - Week
  - Month
  - Custom Date Range

 

**12. Notifications**

**Staff Notifications**

Staff should receive notifications for:

  - QR Code Generated
  - Attendance Updated
  - Leave Approved
  - Leave Rejected

 

**Admin Notifications**

Admins should receive notifications for:

  - Staff Birthday
  - Staff Not Checked Out
  - Missing Attendance
  - Document Expiry
  - Leave Request Submitted

 

**13. Reports**

Admins should be able to download reports.

**Staff Register**

  - Staff ID
  - Name
  - Category
  - Designation
  - Joining Date
  - Status

 

**Attendance Report**

  - Daily Attendance
  - Monthly Attendance
  - Full Day
  - Half Day
  - Leave
  - Absent
  - Holiday

 

**Working Hours Report**

Display:

  - Check-In
  - Check-Out
  - Total Hours Worked

 

**Leave Report**

Display:

  - Leave Type
  - Leave Dates
  - Status
  - Reason

 

**Document Report**

Display:

  - Uploaded Documents
  - Missing Documents
  - Expiring Documents

 

**Active Staff Report**

Display all currently active staff.

 

**Inactive Staff Report**

Display:

  - Resigned
  - Terminated
  - Retired
  - Inactive

 

Export Options:

  - PDF
  - Excel
  - CSV

 

**14. Search & Filters**

Admins should be able to search staff using:

  - Staff ID
  - Staff Name
  - Mobile Number
  - Designation
  - Category

Filters:

  - Active
  - Inactive
  - On Leave
  - Present
  - Absent
  - Department
  - Category
  - Date Range

 

**15. Staff Status Lifecycle**

Each staff member should follow the lifecycle below:

Registered

↓

Active

↓

On Leave (Optional)

↓

Inactive / Resigned / Terminated / Retired

The complete history should remain permanently stored.

 

**16. Business Rules**

  - Every staff member should have a unique Staff ID generated automatically.
  - Every staff member should have a unique QR Code.
  - QR scanning and manual attendance should both be supported.
  - Manual attendance entered by the admin should override QR attendance if necessary.
  - Staff records should never be permanently deleted.
  - Inactive staff should remain available for reports and historical records.
  - All uploaded documents should remain linked to the staff profile.
  - Document history should be maintained whenever a document is replaced.
  - Working hours should be calculated automatically based on QR check-in and check-out times.
  - Only authorized admins should be able to manage staff belonging to their organization.
  - QR entry/exit records should be maintained permanently for audit purposes.

 

**17. Future Ready**

The module should be designed so that the following features can be added later without major redevelopment:

  - Face Recognition Attendance
  - Biometric Machine Integration
  - RFID Card Integration
  - GPS-Based Attendance
  - Payroll Integration
  - Shift Management
  - Overtime Management

 

**Note**

  - Reuse the **Visitor Management QR Scanning Engine** for staff check-in/check-out to reduce duplicate development.
  - Use the same **notification framework** already implemented across JiNANAM.
  - The module should be configurable so that new staff categories, departments, document types, and attendance statuses can be added in the future without code changes.
  - Keep the interface simple and optimized for temple and trust administrators who may not have technical expertise.  

# General Bookings (Temple)  

# **General Booking & Reservation Management**

## **Purpose**

The **General Booking & Reservation Management** module enables Temples, Jain Centres, Bhojanshalas, Pathshalas, and other authorized organizations to manage all **non-accommodation bookings** through a single, unified booking engine.

This module is **not** intended for Dharamshala accommodation bookings (Rooms, Dormitories, Common Halls, etc.), which are managed separately under the **Accommodation Booking Management** and **Accommodation Stay Management** modules.

The objective is to provide one common booking engine for all services that require advance reservations while keeping the booking process simple, transparent, and scalable.

  

# **1. Booking Item Setup**

The respective Admin should configure all bookable services from the Admin Panel.

**Navigation**

Booking Management → Booking Setup → Create Booking Item

For every booking item, configure:

  - Booking Item Name
  - Booking Category
  - Description
  - Images
  - Terms & Conditions
  - Booking Guidelines
  - Cancellation Policy
  - Booking Type (Free / Paid)
  - Booking Duration
  - Booking Capacity
  - Availability Calendar
  - Charges
  - Currency (Auto based on Country)
  - Bank Details
  - UPI Details
  - Status (Active / Inactive)

The booking item should be configured only once and can be edited whenever required.

  

# **2. Booking Categories**

The system should support configurable booking categories.

Examples:

  - Temple Hall
  - Event Hall
  - Temple Space
  - Pooja Booking
  - Pooja Material
  - Bhojanshala Booking
  - Pathshala Hall
  - Seminar Hall
  - Conference Hall
  - Meeting Room
  - Locker
  - Parking
  - Religious Ceremony
  - Other

The Super Admin should be able to create additional booking categories without redevelopment.

  

# **3. Booking Configuration**

For every booking item, configure:

### **Booking Type**

  - Free
  - Paid

### **Booking Duration**

  - Hourly
  - Half Day
  - Full Day
  - Multiple Days
  - Custom Time Slots

### **Booking Capacity**

  - Maximum Bookings
  - Maximum Participants

### **Availability**

  - Available Days
  - Available Time Slots
  - Blackout Dates
  - Maintenance Days
  - Reserved Dates
  - Festival Restrictions

The system should automatically prevent bookings on unavailable dates and time slots.

  

# **4. Reservation Management (Admin)**

Admins should be able to reserve booking items for internal use.

Examples:

  - Temple Function
  - Trust Meeting
  - Religious Ceremony
  - VIP Visit
  - Community Event
  - Internal Use
  - Festival
  - Maintenance
  - Other

Reserved slots should immediately become unavailable for members.

Members should simply see the slot as **Unavailable**.

Admins should be able to edit or remove reservations at any time.

  

# **5. Availability Calendar**

Members should be able to view live availability before placing a booking.

Calendar Status:

  - Available
  - Reserved
  - Booked
  - Unavailable
  - Maintenance

Members should only be able to select available dates and time slots.

  

# **6. Member Booking Flow**

Member opens:

Temple / Jain Centre

↓

Select Booking Item

↓

View Details

↓

Check Availability

↓

Select Date & Time

↓

Submit Booking Request

↓

Booking Status:

**Pending Approval**

  

# **7. Booking Approval**

The Admin reviews the booking request.

Admin Actions:

  - Approve
  - Reject
  - Request Additional Information

For paid bookings, payment should begin only after approval.

  

# **8. Payment Window**

For paid bookings, the Admin should configure the payment completion time.

Examples:

  - 2 Hours
  - 3 Hours
  - 6 Hours
  - 12 Hours
  - 24 Hours

The payment countdown begins immediately after booking approval.

If payment is not completed within the configured time:

  - Booking automatically expires
  - Slot becomes available again
  - Member receives notification

  

# **9. Offline Payment Flow**

Phase 1 supports offline payment methods.

Members pay through:

  - Bank Transfer
  - UPI
  - Other Offline Methods

Display:

  - Bank Name
  - Account Number
  - IFSC Code
  - UPI ID
  - QR Code

Member uploads:

  - Payment Screenshot
  - Reference Number (Optional)
  - Payment Notes (Optional)

Status:

**Payment Verification Pending**

  

# **10. Payment Verification**

The Admin manually verifies the payment.

Actions:

  - Approve
  - Reject

If approved:

  - Booking becomes Confirmed
  - Receipt generated
  - Confirmation notification sent

If rejected:

  - Member notified
  - Option to upload payment proof again (if enabled)

  

# **11. Receipt Generation**

Once payment is approved, the system should automatically generate a digital receipt.

Receipt should include:

  - Booking ID
  - Receipt Number
  - Booking Item
  - Member Name
  - JiNANAM Member ID
  - Organization Name
  - Booking Date
  - Booking Duration
  - Amount Paid
  - Payment Reference
  - Date & Time

Members should be able to download receipts anytime from the Member App.

  

# **12. Booking Status Timeline**

Members should always see the complete booking journey.

Supported Statuses:

  - Booking Submitted
  - Pending Approval
  - Approved
  - Payment Pending
  - Payment Verification
  - Confirmed
  - Rejected
  - Cancelled
  - Expired

Every status change should include the date and time.

  

# **13. My Bookings**

All bookings across JiNANAM should appear in one common section.

Examples:

  - Temple Hall
  - Temple Space
  - Pooja
  - Pooja Material
  - Bhojanshala
  - Jain Centre
  - Parking
  - Lockers
  - Future Booking Categories

Members should never have separate booking sections for different modules.

  

# **14. Past Bookings**

Completed and expired bookings should automatically move to **Past Bookings**.

Members should be able to filter by:

  - Monthly
  - Yearly
  - Booking Category
  - Organization

Booking history should remain permanently stored.

  

# **15. Cancellation Policy**

Every booking item should display its cancellation policy.

In Phase 1:

Members can only view the cancellation policy.

Cancellation approval remains under Admin control.

  

# **16. QR Code (Future Ready)**

Once a booking is confirmed, the system should support automatic QR Code generation in future.

This QR Code may later be used for:

  - Entry Validation
  - Attendance
  - Booking Verification
  - Event Entry
  - Hall Access

  

# **17. Notifications**

### **Member Notifications**

  - Booking Submitted
  - Booking Approved
  - Booking Rejected
  - Payment Window Started
  - Payment Reminder
  - Payment Verification Pending
  - Booking Confirmed
  - Booking Cancelled
  - Booking Expired
  - Upcoming Booking Reminder (24 Hours Before)

### **Admin Notifications**

  - New Booking Request
  - Payment Screenshot Uploaded
  - Payment Verification Pending
  - Booking Cancelled
  - Upcoming Bookings
  - Daily Booking Summary

  

# **18. Search & Filters**

Members should be able to search bookings using:

  - Booking ID
  - Organization Name
  - Booking Category
  - Date

Filters:

  - Active
  - Pending
  - Confirmed
  - Cancelled
  - Expired
  - Monthly
  - Yearly

  

# **19. Reports**

Admins should be able to generate:

  - Booking Register
  - Daily Bookings
  - Monthly Bookings
  - Yearly Bookings
  - Revenue Report
  - Pending Payment Report
  - Reservation Report
  - Booking Category Report
  - Member-wise Report

Export Formats:

  - PDF
  - Excel
  - CSV

  

# **20. Business Rules**

  - A single General Booking & Reservation Engine should be used across all JiNANAM modules except Dharamshala Accommodation.
  - Admins should configure booking items only once.
  - Members should only see available booking slots.
  - Admin reservations should immediately block member bookings.
  - Every booking request should require Admin approval before payment.
  - Phase 1 supports only offline payment verification.
  - The payment window should be configurable by the Admin.
  - Expired payment windows should automatically cancel the booking and release availability.
  - Manual payment verification is mandatory before confirming any paid booking.
  - Every confirmed booking should automatically generate a receipt.
  - All bookings should appear under a common **My Bookings** section.
  - Booking history should remain permanently stored.
  - Every booking, reservation, approval, payment verification, and status change should be recorded in the audit logs.
  - **This module is intended only for non-accommodation bookings. Dharamshala accommodation (Rooms, Dormitories, Common Halls, Halls, Cottages, Apartments, Suites, etc.) will be managed through the separate Accommodation Booking Management and Accommodation Stay Management modules.**

  

# **21. Ready**

The General Booking & Reservation Engine should support future enhancements without redevelopment, including:

  - Online Payment Gateway
  - Booking QR Code
  - Waitlist Management
  - Partial Payments
  - Advance Deposits
  - Dynamic Pricing
  - Recurring Bookings
  - Auto Booking Approval
  - Calendar Integration
  - Email Confirmations
  - WhatsApp Booking Receipts

  

# **Note**

The **General Booking & Reservation Management** module should serve as the centralized booking engine for all **non-accommodation services** within the JiNANAM platform, such as Temple Halls, Pooja Bookings, Pooja Materials, Bhojanshala Bookings, Pathshala Halls, Parking, Lockers, and other future services.

This module is intentionally independent of the Dharamshala Accommodation modules, ensuring a clear separation between **general service bookings** and **guest accommodation management**. This architecture keeps the platform simple for administrators, easier to maintain, and scalable for future enhancements without redevelopment.

  
**  
**

# Offers**  
**

**Module: Offers & Benefits**

 

**1. Offers Dashboard (Super Admin)**

This module will be managed **only by the Super Admin**. No Temple Admin, Jain Centre Admin, Dharamshala Admin, or any other admin should have access to create, edit, or manage offers.

The dashboard should display:

  - Total Offers
  - Active Offers
  - Upcoming Offers
  - Expired Offers
  - Archived Offers
  - Featured Offers
  - Total Views
  - Total Clicks
  - Total Saved Offers
  - Top Performing Categories
  - Top Performing Cities

Quick Actions:

  - Create Offer
  - Edit Offer
  - Delete Offer
  - Archive Offer
  - View Analytics
  - View Reports

 

**2. Create New Offer**

The Super Admin should be able to create a new offer by entering the following details.

**Basic Information**

  - Company Name
  - Company Logo
  - Offer Title
  - Offer Description
  - Offer Banner/Image
  - Redirect URL (Website/Landing Page)
  - Company Website
  - Contact Number
  - WhatsApp Number
  - Google Maps Location

 

**Offer Duration**

The Super Admin should configure:

  - Start Date
  - End Date

Business Rules:

  - If today's date is before the configured Start Date, the offer remains in the **Upcoming Offers** section.
  - On the Start Date, the offer automatically becomes **Active**.
  - On the End Date, the offer automatically moves to **Expired Offers** and becomes invisible to members.
  - Expired offers should not be deleted and should remain available in the Archived section for reporting purposes.

 

**3. Offer Categories**

The Super Admin should assign one category to every offer.

Categories:

  - Food
  - Travel
  - Healthcare
  - Property
  - Jewellery
  - Automobile
  - Education
  - Fashion & Lifestyle
  - Electronics
  - Banking & Finance
  - Home Services
  - Fitness & Wellness
  - Entertainment
  - Charity
  - Professional Services
  - Shopping
  - Religious
  - Others

These categories should remain configurable by the Super Admin.

 

**4. Featured Offers**

Every newly published offer should automatically appear in the **Featured Offers** section for a limited period.

**Featured Logic**

|  |  |
| :-: | :-: |
| **Offer Duration** | **Featured Duration** |
| Up to 30 Days | First 3 Days |
| 31–90 Days | First 10 Days |
| 91–365 Days | First 30 Days |

After the featured period ends, the offer should automatically move to the regular Offers listing while remaining active until its expiry date.

No manual intervention should be required.

 

**5. Offer Visibility Engine**

The Offers module should use the same **Visibility Engine** implemented across the JiNANAM platform.

The Super Admin should define where the offer is visible.

**Geographic Visibility**

  - Country
  - State
  - District
  - City
  - Area
  - GPS Radius (Optional)

Example:

India

↓

Gujarat

↓

Bhavnagar

↓

Palitana

↓

5 KM Radius

Only eligible members should see the offer.

 

**Member Visibility Logic**

Members should receive offers based on:

**Profile Address**

The address configured in their JiNANAM profile.

AND

**Current GPS Location**

If the member is travelling to another city or state, offers available in the current location should also be displayed.

Example:

Member Profile:

Mumbai

Current Location:

Ahmedabad

The member should see:

  - Mumbai Offers
  - Ahmedabad Offers

This ensures members always receive relevant offers, whether at home or travelling.

 

**6. Offer Listing (Member App)**

The Offers page should be designed to maximize engagement.

The page should display the following sections:

**Featured Offers**

Large banner carousel.

 

**Categories**

Display category icons.

Examples:

  - Food
  - Travel
  - Healthcare
  - Property
  - Automobile
  - Shopping

 

**Offers Near You**

Based on current GPS location.

 

**Offers In Your Home City**

Based on profile address.

 

**Recently Added Offers**

Newest active offers.

 

**Expiring Soon**

Offers ending soon.

 

**Saved Offers**

Offers bookmarked by the member.

 

**7. Offer Detail Page**

Every offer should display:

  - Company Logo
  - Company Name
  - Offer Banner
  - Offer Title
  - Offer Description
  - Category
  - Offer Start Date
  - Offer End Date
  - Contact Number
  - WhatsApp Button
  - Website Button
  - Google Maps Button
  - Visit Website Button
  - Save Offer Button
  - Share Button

Members should not be able to edit or report offers.

 

**8. Search**

Members should be able to search offers using:

  - Company Name
  - Offer Title
  - Category
  - City
  - Brand

Search results should update instantly.

 

**9. Filters**

Members should be able to filter offers by:

  - Nearby
  - Home City
  - Newest
  - Expiring Soon
  - Category

Examples:

  - Food
  - Travel
  - Healthcare
  - Shopping
  - Property
  - Automobile

Multiple filters should work together.

 

**10. Save Offers**

Members should be able to bookmark offers.

Saved offers should appear under:

**Saved Offers**

Members can remove saved offers at any time.

 

**11. Share Offers**

Members should be able to share offers through:

  - WhatsApp
  - Facebook
  - Instagram
  - Telegram
  - Copy Link

The shared link should be a JiNANAM Deep Link.

If the JiNANAM App is installed:

Open the offer directly.

If the app is not installed:

Redirect to the Play Store/App Store and open the offer after installation.

 

**12. Offer Notifications**

The notification schedule should be automatic.

**Offer Goes Live**

Recipients:

Eligible members based on the Visibility Engine.

 

**Mid-Month Reminder**

Sent 15 days after the offer becomes active.

Recipients:

Eligible members.

 

**Expiry Reminder**

Sent 24 hours before the offer expires.

Recipients:

Eligible members.

 

**Notification Logic**

**1-Month Offer**

  - Day 1
  - Day 15
  - 24 Hours Before Expiry

Total:

3 Notifications

 

**3-Month Offer**

Every month:

  - Day 1
  - Day 15
  - 24 Hours Before Month End

Total:

9 Notifications

 

**1-Year Offer**

Repeat the same notification cycle every month.

Total:

36 Notifications

 

**13. Offer Analytics**

The system should record:

  - Total Views
  - Total Website Clicks
  - Total Shares
  - Total Saved Offers
  - Click-Through Rate (CTR)

These analytics should be visible only to the Super Admin.

 

**14. Offer Reports**

The Super Admin should be able to download reports.

Reports should include:

**Offer Report**

  - Offer ID
  - Company Name
  - Category
  - Start Date
  - End Date
  - Status

 

**Performance Report**

  - Views
  - Website Clicks
  - Saved Offers
  - Shares

 

**Location Report**

Display performance based on:

  - Country
  - State
  - District
  - City
  - Area

 

**Category Report**

Display:

  - Total Offers
  - Most Viewed Category
  - Most Clicked Category

 

Export Options:

  - PDF
  - Excel
  - CSV

 

**15. Offer Status**

Each offer should follow the lifecycle below:

Draft

↓

Upcoming

↓

Featured

↓

Active

↓

Expired

↓

Archived

Business Rules:

  - Upcoming offers are not visible to members.
  - Featured offers automatically move to Active after the configured featured duration.
  - Active offers remain visible until expiry.
  - Expired offers are automatically removed from member visibility.
  - Archived offers remain available only for reports and analytics.

 

**16. Disclaimer**

Every offer page should display the following disclaimer:

**Disclaimer:** JiNANAM only provides a platform for businesses to showcase their offers. JiNANAM does not guarantee, endorse, verify, or take responsibility for the quality, availability, pricing, products, services, disputes, losses, damages, or claims arising from these offers. Members are advised to verify all information directly with the respective business before making any purchase or transaction.

 

**17. Business Rules**

  - Only the Super Admin can create, edit, delete, archive, or manage offers.
  - Offers should automatically activate and deactivate based on the configured dates.
  - No offer should remain visible after its expiry date.
  - All offers should remain archived for reporting and analytics.
  - Visibility should always be determined using both the member's profile address and current GPS location.
  - Community-based filtering should **not** apply to offers; all eligible members within the configured geographic area should see them.
  - Featured status should be managed automatically based on the offer duration.
  - Members can save and share offers but cannot modify or report them.
  - Every website click, share, save, and view should be recorded for analytics.
  - All offers should include the standard JiNANAM disclaimer.

 

**Final Notes**

  - Design the Offers & Benefits page with a modern, card-based UI using large promotional banners to maximize engagement.
  - Prioritize Featured Offers at the top, followed by category navigation and personalized offer sections.
  - Use the same Geo-Targeting Engine developed for the Events module to ensure consistency across the JiNANAM platform.
  - The module should be built in a configurable manner so categories, visibility, notification schedules, and reporting can be extended in the future without structural changes. 

  
  

# Events  

**Module: Event Management System**

**Part 1 of 10**

 

**1. Module Overview**

**1.1 Module Name**

**Event Management System**

 

**1.2 Purpose**

The JiNANAM Event Management System is a centralized platform that enables temples, Jain centres, and JiNANAM administrators to organize, manage, promote, and monitor both **Free** and **Paid** events.

The system is designed to streamline the complete lifecycle of an event—from creation and publishing to registrations, attendance, notifications, gallery management, reporting, and historical records.

The platform must support intelligent audience targeting based on:

  - Geographic Location
  - Member Profile Address
  - Current GPS Location
  - Jain Community
  - Sect & Sub-sect
  - Linked Temples
  - Temple Followers

This ensures that only the most relevant members receive event notifications while maintaining a personalized user experience across the JiNANAM ecosystem.

 

**2. Business Objectives**

The Event Management module has the following primary objectives:

**Digital Event Management**

Provide temples and JiNANAM administrators with a structured platform to create, publish, and manage events digitally.

 

**Targeted Event Visibility**

Allow events to be shared only with relevant members based on:

  - Country
  - State
  - District
  - City
  - Area
  - GPS Radius
  - Jain Community
  - Sect
  - Sub-Sect
  - Temple Followers
  - Linked Members

 

**Increase Event Participation**

Provide RSVP functionality, reminder notifications, and personalized recommendations to maximize attendance.

 

**Centralized Event Records**

Maintain complete records of:

  - Upcoming Events
  - Active Events
  - Completed Events
  - Cancelled Events

for both administrators and members.

 

**Paid Event Management**

Allow JiNANAM Super Admin to organize paid events with:

  - Online ticket booking
  - Payment Gateway
  - Seating Layout
  - QR Tickets
  - Attendance Management

 

**Post Event Engagement**

Allow administrators to upload event galleries, videos, and feedback after event completion.

 

**Analytics & Reporting**

Provide complete event insights including:

  - Registrations
  - Attendance
  - Revenue
  - Demographics
  - Notifications
  - Event Performance

 

**3. Module Scope**

The Event Management System consists of two event types.

 

**Option 1**

**Free Events**

Created directly by Temple Admins.

Used for:

  - Religious Events
  - Pravachans
  - Poojas
  - Camps
  - Community Meetings
  - Yatras
  - Blood Donation Camps
  - Charity Programs
  - Cultural Programs

Unlimited free events can be created.

 

**Option 2**

**Paid Events**

Created only by JiNANAM Super Admin.

Temple Admins wishing to organize paid events must raise a support ticket.

JiNANAM team creates the event on behalf of the requesting organization.

Supports:

  - Ticket Booking
  - Online Payment
  - Seating Selection
  - QR Entry
  - Revenue Tracking

 

**4. User Roles**

The Event Management System consists of four primary user roles.

 

**4.1 Super Admin**

Platform:

Web Portal

Permissions:

  - Create Free Events
  - Create Paid Events
  - Edit Any Event
  - Delete Any Event
  - Manage Seating Plans
  - Configure Pricing
  - Configure Ticket Categories
  - Scan QR Tickets
  - View National Reports
  - Upload Event Galleries
  - Manage Event Policies
  - Cancel Events
  - Process Refunds (Manual)

Super Admin has unrestricted access.

 

 

 

**4.2 Temple Admin**

Platform:

Web Portal

Permissions:

  - Create Unlimited Free Events
  - Publish Events
  - View RSVP Members
  - Upload Event Galleries
  - Download Reports
  - View Analytics

Restrictions:

Cannot:

  - Create Paid Events
  - Delete Completed Events
  - Modify Completed Event Details
  - Edit Paid Events
  - Process Ticket Payments

If Paid Event is selected:

Display:

"Paid Events can only be created by JiNANAM. Please raise a support ticket."

Button:

**Raise Support Ticket**

 

**4.3 Member**

Platform:

JiNANAM Mobile App

Members can:

  - Discover Events
  - RSVP
  - Join Waiting List
  - Purchase Tickets
  - View Event Gallery
  - Share Event
  - View Past Events
  - Rate Events

Members cannot:

  - Create Events
  - Modify Events
  - Access Reports

 

**4.4 Event Scanner (Super Admin Team)**

Platform:

Android Scanner App

Responsibilities:

  - Scan QR Tickets
  - Validate Tickets
  - Mark Attendance

Cannot:

  - Edit Events
  - View Revenue
  - Modify Bookings

 

**5. Platform Architecture**

The Event Management System consists of four connected platforms.

 

**Admin Web Portal**

Used for:

  - Event Creation
  - Reports
  - Analytics
  - RSVP Management
  - Gallery Upload
  - Settings

 

**JiNANAM Member App**

Used for:

  - View Events
  - RSVP
  - Buy Tickets
  - QR Ticket
  - Gallery
  - Feedback
  - Past Events

 

**QR Scanner App**

Used during paid events.

Functions:

  - Scan Tickets
  - Validate QR
  - Mark Attendance

 

**Backend**

Responsible for:

  - Notifications
  - Payments
  - Ticket Generation
  - RSVP
  - Waiting List
  - Reports
  - Event Visibility
  - Community Filtering

 

 

 

 

 

**6. Community Visibility Engine**

This visibility engine should be common across the entire JiNANAM platform and reused for Events, Announcements, Feed, Polls, Offers, Notifications, and all future content modules.

When creating an event, the administrator must define the target audience based on the Jain community hierarchy.

**Audience Options**

  - All JiNANAM Members
  - All Jain Members
  - Digambar
      
      - Bispanthi
      - Terapanthi
      - Taran Panth
      - Other Digambar Traditions
  - Shwetambar
      
      - Murtipujak
          
          - Tapa Gaccha
          - Khartar Gaccha
          - Achalgaccha
          - Tristutik Gaccha
          - Other Gacchas
      - Sthanakvasi
      - Terapanth

**Business Rule**

Example:

If an event is created for:

**Shwetambar → Murtipujak → Tapa Gaccha**

Only members belonging to that exact hierarchy should receive:

  - Event Visibility
  - Notifications
  - RSVP Access
  - Event Recommendations

This filtering engine must remain consistent across all JiNANAM modules.

 

**7. Geo-Targeting Engine**

Every event should support intelligent geographic targeting.

The administrator can choose one or multiple targeting methods.

**Geographic Filters**

  - Country (List of all countries)
  - State (list of all states)
  - City (List of all city)
  - Area (List of all areas)
  - Radius (GPS)

Example:

Country

↓

India

↓

State

↓

Maharashtra

↓

City

↓

Mumbai

↓

Area

↓

Borivali

↓

Radius

↓

10 KM

 

**Member Eligibility**

Members become eligible if either:

  - Their profile address matches the selected location.

OR

  - Their current GPS location falls within the configured radius.

This dual-location approach ensures that both residents and members currently visiting the area can discover the event.

 

**8. Event Lifecycle**

Every event must follow a predefined lifecycle.

Draft  
    ↓  
 Published  
    ↓  
 RSVP Open  
    ↓  
 RSVP Closed  
    ↓  
 Live  
    ↓  
 Completed  
    ↓  
 Gallery Uploaded  
    ↓  
 Archived

Each stage controls available actions, notifications, and permissions.

For example:

  - Draft → Only editable by creator.
  - Published → Visible to eligible members.
  - RSVP Open → Members can register.
  - RSVP Closed → Waiting list only (if enabled).
  - Live → Event in progress.
  - Completed → Event details locked.
  - Gallery Uploaded → Photos and videos available.
  - Archived → Historical record.

 

**9. High-Level Business Workflow**

**Free Event**

Temple Admin → Create Event → Configure Audience → Publish → Notifications Sent → Members RSVP → Event Conducted → Gallery Uploaded → Reports Generated → Event Archived.

**Paid Event**

Temple Admin → Raise Support Ticket → JiNANAM Super Admin Creates Event → Configure Seating & Pricing → Publish → Members Book Tickets → Payment → QR Ticket Generated → Attendance via QR Scan → Gallery Uploaded → Reports & Revenue → Event Archived.

 

**Part 2 of 10**

 

**10. Admin Event Management (Web Portal)**

**10.1 Purpose**

The Event Management module in the Admin Portal enables Temple Administrators and Super Administrators to create, publish, manage, monitor, and archive events.

The interface should be designed for non-technical users with a step-by-step event creation wizard, ensuring ease of use while maintaining flexibility for advanced event configurations.

 

**10.2 Event Dashboard**

The Event Dashboard serves as the central control panel for all event-related activities.

**Summary Cards**

Display the following metrics:

  - Total Events
  - Active Events
  - Upcoming Events
  - Completed Events
  - Cancelled Events
  - Total RSVP
  - Waiting List Count
  - Paid Tickets Sold (Super Admin Only)
  - Total Revenue (Super Admin Only)

 

 

**Event Listing**

Each event should display:

  - Event Banner
  - Event Title
  - Event Category
  - Event Type (Free / Paid)
  - Temple Name
  - Event Location
  - Start Date
  - End Date
  - Status
  - RSVP Count
  - Waiting List Count
  - Attendance Count
  - Gallery Status

Actions:

  - View
  - Edit (Based on Rules)
  - Upload Gallery
  - Download Report
  - Share Event
  - Archive

 

**11. Event Creation Wizard**

The event creation process should be divided into logical steps to reduce user errors.

**Step 1 – Basic Information**

**Mandatory Fields**

  - Event Title *
  - Event Category *
  - Event Type *
  - Event Banner *
  - Start Date *
  - End Date *
  - Event Start Time *
  - Event End Time *
  - Venue Name *
  - Full Address *
  - Google Maps Location (Pin Location)
  - Event Description *
  - Event Organised By (Auto-filled with Temple Name)
  - Event Sponsored by with description (Link members) Option to add multiple members with each member a description box
  - Link MS (option to add multiple MS)
  - Contact Person (link members here and display mobile number) Option to add multiple members

<!-- end list -->

  - External Links 
  - Additional Notes

 

**Event Categories**

Administrator must select one category.

  - Religious
  - Pravachan
  - Pooja
  - Cultural Program
  - Community Meeting
  - Youth Event
  - Women's Program
  - Senior Citizen Program
  - Charurmas
  - Paryushan
  - Ayambil
  - Varshitap
  - Other

These categories should remain configurable by the Super Admin and Admin.

 

**12. Event Type Selection**

Administrator must choose one option.

**Option 1 – Free Event**

Selecting this enables:

  - RSVP
  - Waiting List
  - Notifications
  - Gallery
  - Reports

Payment-related features remain hidden.

 

**Option 2 – Paid Event**

Temple Admins cannot create paid events.

If a Temple Admin selects **Paid Event**, the system should display the following message:

**Paid Events are managed exclusively by JiNANAM. If you wish to organize a paid event, please raise a support ticket. Our team will coordinate with you and create the event on your behalf.**

Buttons:

  - Raise Support Ticket
  - Cancel

Only Super Admin can proceed with paid event creation.

 

**13. Audience Selection Engine**

Before publishing an event, administrators must define who should receive and view the event.

This is one of the most important components of the JiNANAM platform.

 

**Step 1 – Geographic Targeting**

Administrator may select:

  - Entire India
  - State
  - District
  - City
  - Area
  - GPS Radius

Multiple selections should be supported.

Example:

India

↓

Maharashtra

↓

Mumbai

↓

Borivali

↓

10 KM Radius

 

**Step 2 – Temple Visibility**

Administrator should be able to choose:

  - All JiNANAM Members
  - Followers of this Temple
  - Linked Members of this Temple
  - Specific Temple Followers (Future)

 

**Step 3 – Community Targeting**

Administrator selects:

  - All Jain Members
  - Digambar
  - Shwetambar

If Digambar is selected:

Display all Digambar traditions.

If Shwetambar is selected:

Display:

  - Murtipujak
  - Sthanakvasi
  - Terapanth

If Murtipujak is selected:

Display all supported Gacchas.

Business Rule:

Only members matching the selected community hierarchy should:

  - Receive Notification
  - View Event
  - RSVP
  - Receive Reminder Notifications

This visibility engine should remain common across:

  - Events
  - Feed
  - Announcements
  - Polls
  - Offers
  - News
  - Notifications

 

**14. RSVP Configuration**

Administrator should configure RSVP settings before publishing.

**RSVP Enabled**

Yes / No

 

**Maximum RSVP Capacity**

Example:

500

Once this limit is reached:

Members should automatically move to the Waiting List.

 

**Waiting List Capacity**

Example:

200

Once Waiting List is also full:

System should automatically close RSVP.

Display:

**RSVP Closed**

 

**Family RSVP**

Administrator may allow members to:

  - Register only themselves

OR

  - Register additional family members

If enabled:

Member selects number of attendees.

Optional:

Collect JiNANAM Member IDs for accompanying members.

Once Member ID is entered,

System automatically displays:

  - Name
  - Gender
  - Age

This helps generate accurate event demographics.

 

**15. Event Attachments**

Administrator may upload files for members to download.

Examples:

  - Invitation Card
  - Event Brochure
  - Registration Form
  - Schedule
  - Sponsorship Details
  - PDF Documents

Supported Formats:

  - PDF
  - DOCX
  - JPG
  - PNG

Maximum size should be configurable by Super Admin.

Members should be able to download these attachments directly from the event page.

 

**16. Event Publishing Rules**

Before publishing,

System should validate all mandatory fields.

Mandatory:

  - Banner
  - Title
  - Category
  - Description
  - Venue
  - Start Date
  - End Date
  - Audience
  - Visibility
  - RSVP Configuration

If validation passes,

Administrator clicks:

**Publish Event**

Immediately after publishing:

The system should:

  - Generate unique Event ID.
  - Make event visible to eligible members.
  - Trigger Event Published notifications.
  - Start reminder schedules.
  - Record Audit Logs.
  - Add event to reports.

 

**17. Editing Rules**

Before Event Starts

Temple Admin can edit:

  - Banner
  - Description
  - Dates
  - Time
  - Attachments
  - Location
  - Audience
  - RSVP Settings
  - Capacity

Whenever an important field changes:

All RSVP members should receive an immediate notification.

Examples:

  - Event Date Changed
  - Venue Changed
  - Event Time Updated
  - Event Cancelled

 

After Event Starts

Temple Admin may edit only:

  - Contact Details
  - Gallery
  - Drive Links
  - YouTube Links

No structural changes should be allowed.

 

After Event Completes

Temple Admin **cannot**:

  - Edit Event Title
  - Change Date
  - Modify Description
  - Delete Event
  - Change Venue
  - Change Audience

Only Gallery updates remain editable.

 

Super Admin Override

Super Admin has unrestricted permissions.

Super Admin may:

  - Edit Any Event
  - Delete Any Event
  - Reopen Archived Events
  - Change Event Ownership
  - Cancel Events
  - Restore Deleted Events (if supported)

 

**18. Event Sharing**

Every event should automatically generate a unique JiNANAM Deep Link.

Example:

jinanam.app/event/JNEV000154

When shared via:

  - WhatsApp
  - Facebook
  - Instagram
  - Telegram
  - Email

Behavior:

**If JiNANAM App Installed**

Open directly inside the app.

**If App Not Installed**

Redirect to:

  - Google Play Store
  - Apple App Store

After installation,

Automatically open the shared event.

This ensures maximum app adoption while making event sharing seamless.

 

**Part 3 of 10**

**Member Application Flow**

**19. Event Discovery (Member App)**

**19.1 Purpose**

The Event section in the JiNANAM Member App is the primary interface through which members discover, register for, attend, and revisit events.

The system should automatically display only those events that are relevant to the member based on the Event Visibility Engine.

The objective is to eliminate irrelevant notifications and ensure that every member receives only personalized event recommendations.

 

**19.2 Event Home Screen**

The Event Dashboard should display events in the following order:

**Upcoming Events**

Events happening soon.

(Default section)

 

**Today's Events**

Events occurring today.

 

**My RSVP**

Events where the member has successfully submitted an RSVP.

 

**My Tickets**

Paid events booked by the member.

 

**Waiting List**

Events where the member is currently on the waiting list.

 

**Past Events**

Events the member:

  - Attended
  - Purchased Tickets For
  - Submitted RSVP For

 

**19.3 Smart Event Visibility**

Members should only see events that satisfy the configured visibility criteria.

**Visibility Conditions**

Member belongs to selected:

  - Country
  - State
  - District
  - City
  - Area
  - GPS Radius

AND

Member belongs to selected:

  - Jain Community
  - Sect
  - Sub-Sect

AND

If selected,

  - Temple Followers
  - Linked Temple Members

Business Rule:

If an event is created for:

**Shwetambar → Murtipujak → Tapa Gaccha → Mumbai**

Only members matching all selected criteria should be able to:

  - View Event
  - Receive Notifications
  - Submit RSVP
  - Purchase Tickets (if paid)

 

**19.4 Event Card**

Each event card should display:

  - Event Banner
  - Event Category
  - Event Title
  - Temple Name
  - Event Date
  - Event Time
  - City
  - Distance from Current Location
  - Free / Paid Badge
  - RSVP Status
  - Seats Left (Paid Events)
  - Event Status

Buttons:

  - View Details
  - RSVP
  - Book Ticket
  - Share

 

**20. Event Detail Screen**

The Event Details page should display complete information.

**General Information**

  - Event Banner
  - Event Title
  - Category
  - Organizing Temple
  - Date
  - Time
  - Venue
  - Google Maps Button
  - Description

 

**Downloads**

Members should be able to download:

  - Invitation Card
  - Event Brochure
  - Schedule
  - Attachments

 

**Gallery Preview**

If event completed:

Display gallery preview.

Members should only have:

View Option

No Download Option.

 

**Share Event**

Share through:

  - WhatsApp
  - Facebook
  - Telegram
  - Email
  - Copy Link

Deep Link Behaviour:

If JiNANAM Installed

↓

Open Event

Otherwise

↓

Open Play Store/App Store

↓

Automatically open event after installation.

 

**21. RSVP Engine**

Applicable only for Free Events.

 

**Submit RSVP**

Member taps:

RSVP

System displays:

Number of Attendees

Default:

1

Member may increase.

 

**JiNANAM Member IDs**

If attending with family,

Member should have two options:

**Option A**

Enter Total Attendees

Example:

4

 

**Option B**

Enter JiNANAM Member IDs

For each entered ID,

System automatically displays:

  - Name
  - Gender
  - Age

This improves attendance tracking.

 

**Capacity Check**

System verifies:

Current RSVP Count.

If seats available,

RSVP Confirmed.

 

**Waiting List**

If RSVP Capacity Full

↓

Move Member to Waiting List.

Waiting List should also have configurable capacity.

If Waiting List becomes full,

Display:

**RSVP Closed**

 

**Cancel RSVP**

Member should be able to cancel RSVP before event starts.

Upon cancellation,

First member from Waiting List automatically moves into Confirmed RSVP.

Notification should be sent to promoted member.

 

**22. Member Notifications**

**Event Published**

Eligible members receive:

"New Event Available"

 

**Reminder Notifications**

Free Events

Notification Schedule

48 Hours Before

↓

12 Hours Before (RSVP Members Only)

↓

2 Hours Before (RSVP Members Only)

 

**Event Updated**

Whenever administrator changes:

  - Date
  - Time
  - Venue

Only RSVP Members receive updated notification.

 

**Gallery Uploaded**

After event completion,

Gallery notification should only be sent to:

Members who attended the event.

Other members may still browse the gallery from the event page.

 

**Waiting List Promotion**

Notification:

"You have been moved from Waiting List to Confirmed RSVP."

 

**23. Event Feedback**

After attendance,

System should ask:

Rate Event

★★★★★

Comment

Optional

Feedback should be available only to:

Temple Admin

Super Admin

 

**24. Past Events**

Members should be able to view complete history.

Categories:

  - RSVP Events
  - Attended Events
  - Ticketed Events

Filters:

  - Month
  - Year

Display:

  - Event Name
  - Temple
  - Attendance Status
  - Event Date

Members should not see:

Inactive events that they never attended or registered for.

 

 

**Part 4 of 10**

**Paid Event Engine**

 

**25. Paid Event Overview**

Paid Events can only be created by JiNANAM Super Admin.

Temple Admins requesting paid events must raise a support ticket.

JiNANAM team creates the event on behalf of the requesting temple or organization.

Temple ownership should still be maintained for reporting and gallery management.

 

**26. Ticket Configuration**

Super Admin should configure:

**Ticket Categories**

Examples

VIP

Premium

Gold

Silver

General

Student

Child

Custom

Unlimited categories supported.

 

For each category configure:

  - Ticket Price
  - Capacity
  - Description
  - Sale Start Date
  - Sale End Date
  - Visibility

 

**27. Seating Engine**

Super Admin may configure two seating modes.

**Mode 1**

Open Seating

First Come First Served.

Member purchases ticket.

Seat assigned at venue.

 

**Mode 2**

Reserved Seating

BookMyShow-style.

Super Admin creates:

Sections

↓

Rows

↓

Seat Numbers

Example

Section A

Row 1

Seats 1–20

Row 2

Seats 21–40

Section B

...

Members select preferred seats.

Unavailable seats shown as occupied.

 

**28. Ticket Booking Flow**

Member opens event.

↓

Select Ticket Category.

↓

Select Number of Tickets.

↓

Select Seats (if enabled).

↓

Enter JiNANAM Member IDs.

↓

System validates each Member ID.

↓

Displays:

  - Name
  - Gender
  - Age

Member may leave additional attendee IDs blank if booking for guests, subject to event policy.

 

 

**29. Payment Flow**

Supported through JiNANAM Payment Gateway.

Payment Summary:

Ticket Price

×

Quantity

\=

Total

No additional convenience fee should be charged.

Only ticket price should be payable.

After successful payment:

  - Booking Confirmed
  - Ticket Generated
  - QR Generated
  - Email Sent
  - App Notification Sent

 

**30. QR Ticket Generation**

Every booking generates a unique QR Ticket.

QR contains encrypted:

  - Ticket ID
  - Event ID
  - Booking ID
  - Member ID
  - Timestamp
  - Validation Token

QR should not expose personal information.

 

**31. Ticket Confirmation**

Member receives:

Email

  -  

In-App Ticket

Ticket displays:

  - Event Banner
  - Event Name
  - Venue
  - Date
  - Time
  - Number of Tickets
  - Seat Numbers (if applicable)
  - QR Code
  - Ticket ID
  - Booking ID

 

**32. Ticket Status**

Each ticket should have one of the following statuses:

  - Pending Payment
  - Payment Successful
  - Ticket Generated
  - Checked In
  - Cancelled
  - Refunded (Manual)
  - Expired

This status history should be visible to the member and Super Admin.

 

**Part 5 of 10**

**Seating Engine & Ticket Allocation**

 

**33. Seating Management Engine**

**33.1 Purpose**

The Seating Management Engine enables JiNANAM Super Admin to configure seating arrangements for paid events.

The system should support both simple events and large-scale events with thousands of attendees.

The seating engine should be modular so that each event can choose the most appropriate seating model.

 

**33.2 Seating Modes**

The Super Admin should have the option to configure one of the following seating modes.

**Mode 1 – Open Seating (First Come First Served)**

Suitable for:

  - Open Grounds
  - Community Halls
  - Religious Gatherings
  - Pravachans
  - Yatras

Features:

  - Members purchase tickets.
  - No seat selection.
  - Members occupy any available seat within the selected ticket category.
  - Ticket displays the ticket category only.

 

**Mode 2 – Reserved Seating**

Suitable for:

  - Auditoriums
  - Indoor Events
  - Cultural Programs
  - Paid Shows
  - Conferences

Members can select specific seats during booking.

 

**33.3 Venue Layout Configuration**

Super Admin should configure:

  - Venue Name
  - Total Capacity
  - Number of Sections
  - Rows per Section
  - Seats per Row

Example:

Venue

↓

Main Hall

↓

Section A

↓

Rows A1–A20

↓

Seats 1–30

↓

Section B

↓

Rows B1–B20

↓

Seats 1–30

There should be no restriction on the number of sections or rows.

 

**33.4 Ticket Categories**

Each section can have a separate pricing category.

Example:

|  |  |  |  |
| :-: | :-: | :-: | :-: |
| **Section** | **Category** | **Price** | **Capacity** |
| A | VIP | ₹2,500 | 100 |
| B | Premium | ₹1,500 | 200 |
| C | Gold | ₹1,000 | 300 |
| D | General | ₹500 | 600 |

The system should support unlimited pricing categories.

 

**33.5 Seat Status**

Every seat must maintain a real-time status.

Possible statuses:

  - Available
  - Reserved (during payment)
  - Booked
  - Checked-In
  - Cancelled
  - Blocked (Admin Use)

Seat colours should visually represent each status.

 

**33.6 Seat Locking**

To prevent double bookings:

When a member selects seats:

  - Seats should be temporarily locked.
  - Lock duration should be configurable (default: 10 minutes).
  - If payment is not completed within the lock period, seats should automatically become available again.

 

**33.7 Seat Selection Rules**

The system should:

  - Prevent selection of booked seats.
  - Prevent selection of blocked seats.
  - Display remaining seats in real time.
  - Update availability instantly after successful payment.

 

**33.8 Capacity Management**

The system should continuously track:

  - Total Capacity
  - Tickets Sold
  - Tickets Remaining
  - Section-wise Availability
  - Category-wise Availability

When capacity reaches zero:

Display:

**Sold Out**

 

**33.9 Waiting List**

If all tickets are sold:

Members should be able to join the Waiting List.

Waiting List capacity should be configurable.

Example:

Tickets: 500

Waiting List: 100

Once Waiting List is full:

Display:

**Bookings Closed**

 

**34. Ticket Allocation**

Upon successful payment:

The system should automatically generate:

  - Booking ID
  - Ticket ID(s)
  - QR Code(s)
  - Invoice Number
  - Payment Reference Number

For multiple tickets in a single booking:

Each attendee should receive a unique Ticket ID and QR Code, while remaining linked to one master Booking ID.

 

**35. Ticket Cancellation & Refund Policy**

Refund rules will be defined per event.

Super Admin should upload:

  - Cancellation Policy
  - Refund Policy
  - Terms & Conditions

Members must accept these policies before payment.

If an event is cancelled:

Refunds will be processed manually by JiNANAM.

 

**36. Event Capacity Dashboard**

For every paid event, Super Admin should be able to monitor:

  - Total Capacity
  - Available Tickets
  - Tickets Sold
  - Waiting List Count
  - Section-wise Sales
  - Category-wise Sales
  - Revenue Collected
  - Revenue Pending (if any)

Temple Admin should only see data related to the event conducted on behalf of their temple.

 

**Part 6 of 10**

**QR Validation, Attendance & Post Event Management**

 

**37. QR Scanner Application**

A dedicated QR Scanner module should be available for JiNANAM Super Admin or authorized event staff.

Purpose:

  - Validate tickets.
  - Prevent duplicate entry.
  - Record attendance.

The scanner should work on Android devices with camera support.

 

**38. QR Validation Workflow**

**Step 1**

Scanner opens QR Scanner.

↓

**Step 2**

Scan attendee QR Code.

↓

**Step 3**

System validates:

  - Ticket exists.
  - Payment successful.
  - Ticket belongs to this event.
  - Ticket not already scanned.
  - Event is active.
  - Scan is within the permitted time window (24 hours before event start until event end).

↓

**Step 4**

If valid:

Display:

  - Member Name
  - JiNANAM ID
  - Ticket Category
  - Seat Number (if applicable)
  - Booking ID
  - Ticket Status

↓

**Step 5**

Mark ticket as:

**Checked-In**

Attendance should be recorded immediately.

 

**39. Duplicate QR Protection**

If the QR Code is scanned again:

Display:

**Ticket Already Used**

Also display:

  - First Scan Time
  - First Scan Gate (if multiple entry gates)
  - Scanner Name

No second entry should be permitted.

 

**40. Attendance Management**

Attendance should be updated automatically after successful QR validation.

Member status should change from:

Registered

↓

Attended

Attendance reports should update in real time.

 

**41. Event Completion**

Once the event end time is reached:

The system should automatically change the event status to:

**Completed**

Business Rules:

  - No further RSVP.
  - No ticket booking.
  - No event detail editing by Temple Admin.
  - Gallery upload enabled.
  - Feedback enabled.

Only Super Admin may reopen or modify completed events.

 

**42. Gallery Management**

After completion, the Temple Admin (or linked organizing temple for paid events) should be able to upload post-event content.

**Image Upload**

Maximum:

25 Images per event.

Supported formats:

  - JPG
  - PNG
  - WEBP

 

**Video Links**

Unlimited links supported.

Examples:

  - Google Drive
  - YouTube
  - Vimeo

Videos should not be uploaded directly to reduce storage costs.

 

**43. Gallery Albums**

Gallery should be organized into albums.

Example:

Mahavir Jayanti 2026

  - Preparation
  - Opening Ceremony
  - Pravachan
  - Cultural Program
  - Prize Distribution
  - Closing Ceremony

This improves browsing and scalability.

 

**44. Gallery Visibility**

Gallery should be visible to:

  - All members who can access the event page.

However:

Gallery upload notifications should be sent **only to members who attended the event** (attendance confirmed via QR scan).

Members can:

  - View images.
  - View videos.
  - Share the event link.

Members **cannot download** images or videos directly from the app.

 

**45. Event Feedback & Rating**

After attending an event, members should receive a prompt to submit feedback.

**Rating**

  - 1 Star
  - 2 Stars
  - 3 Stars
  - 4 Stars
  - 5 Stars

**Comment**

Optional text feedback.

Feedback should only be accepted from members whose attendance is marked as **Attended**.

Temple Admin and Super Admin should have access to:

  - Average Rating
  - Total Responses
  - Feedback Comments
  - Rating Distribution

This data should be available in the Event Analytics Dashboard.

 

**Part 7 of 10**

**Dashboard, Reports & Analytics**

 

**46. Event Dashboard (Temple Admin)**

**46.1 Purpose**

The Event Dashboard provides Temple Administrators with a centralized overview of all events managed under their temple. It enables administrators to monitor event performance, registrations, attendance, engagement, and post-event activities.

Temple Admin should only see events belonging to their temple.

 

**46.2 Dashboard Summary Cards**

The dashboard should display the following real-time statistics:

**Event Summary**

  - Total Events
  - Upcoming Events
  - Active Events
  - Completed Events
  - Cancelled Events

**Registration Summary**

  - Total RSVP
  - Confirmed RSVP
  - Waiting List
  - Total Attendance
  - Attendance Percentage

**Engagement Summary**

  - Event Views
  - Shares
  - Notification Sent
  - Notification Opened
  - Gallery Uploaded (Yes/No)

 

**46.3 Event Performance Table**

Each event should display:

|  |  |
| :-: | :-: |
| **Field** | **Description** |
| Event ID | Auto Generated |
| Event Banner | Thumbnail |
| Event Name | Event Title |
| Event Type | Free / Paid |
| Category | Religious, Pravachan, etc. |
| Start Date | Event Date |
| End Date | Event Date |
| Status | Draft, Published, Live, Completed |
| RSVP Count | Total Confirmed |
| Waiting List | Current Count |
| Attendance | Members Attended |
| Rating | Average Rating |
| Gallery | Uploaded / Pending |

Actions:

  - View
  - Edit (Based on Permissions)
  - Upload Gallery
  - Download Report
  - Share
  - Archive

 

**46.4 Analytics Dashboard**

The analytics dashboard should provide graphical insights.

Charts:

**Event Trend**

  - Daily
  - Weekly
  - Monthly
  - Yearly

 

**RSVP Trend**

Display:

  - Confirmed RSVP
  - Waiting List
  - Attendance

 

**Demographics**

Breakdown by:

  - Male
  - Female
  - Age Groups
  - City
  - State
  - Community
  - Sect / Sub-Sect

 

**Engagement**

Display:

  - Total Views
  - Notification Delivered
  - Notification Opened
  - Link Clicks
  - Shares

 

**47. Super Admin Dashboard**

Super Admin should have visibility across all temples and organizations.

Additional Dashboard Cards:

  - Total Events Across Platform
  - Free Events
  - Paid Events
  - Total Revenue
  - Total Tickets Sold
  - Total Attendance
  - Top Performing Events
  - Highest Revenue Events
  - Most Active Temples

 

**Filters**

  - Country
  - State
  - City
  - Temple
  - Community
  - Event Category
  - Event Type
  - Date Range

 

**48. Reports**

Temple Admin and Super Admin should be able to generate detailed reports.

 

**Event Report**

Fields:

  - Event ID
  - Event Name
  - Event Category
  - Event Type
  - Temple
  - Location
  - Start Date
  - End Date
  - Status

 

**RSVP Report**

Fields:

  - JiNANAM Member ID
  - Member Name
  - Gender
  - Age
  - City
  - State
  - Community
  - RSVP Date
  - Number of Attendees
  - Waiting List Status

 

**Attendance Report**

Fields:

  - Ticket ID
  - Member Name
  - QR Scan Time
  - Attendance Status
  - Entry Gate (if applicable)

 

**Paid Event Report**

Additional fields:

  - Ticket Category
  - Quantity
  - Ticket Amount
  - Payment Reference
  - Payment Status
  - Booking Date
  - Refund Status

 

**Revenue Report (Super Admin Only)**

Display:

  - Gross Revenue
  - Refunds
  - Net Revenue
  - Tickets Sold
  - Category-wise Revenue

 

**Gallery Report**

Display:

  - Images Uploaded
  - Albums Created
  - Video Links Added
  - Gallery Upload Date

 

**Feedback Report**

Display:

  - Average Rating
  - Total Responses
  - Rating Distribution
  - Comments

 

**49. Export Options**

Temple Admin:

  - PDF
  - Excel (XLSX)
  - CSV

Super Admin:

  - PDF
  - Excel
  - CSV
  - Bulk Export

All exported reports should include:

  - JiNANAM Branding
  - Temple Name
  - Report Generated Date
  - Generated By
  - Applied Filters

 

 

**50. Search & Filters**

The Event module should support advanced search.

**Search By**

  - Event ID
  - Event Name
  - Temple Name
  - Category
  - Member ID
  - Booking ID
  - Ticket ID

 

**Filters**

  - Free / Paid
  - Upcoming
  - Live
  - Completed
  - Cancelled
  - Community
  - City
  - State
  - Date Range
  - Attendance Status
  - Gallery Uploaded

 

 

**Part 8 of 10**

**Notification Engine, Business Rules & Validation Rules**

 

**51. Notification Engine**

The notification system should automatically trigger messages based on event lifecycle and member interactions.

Notifications should support:

  - Push Notifications
  - Email (where applicable)
  - In-App Notifications

Future-ready for WhatsApp and SMS integration.

 

**52. Notification Trigger Matrix**

**Event Published**

**Recipients:**

Eligible members based on:

  - Location
  - Community
  - Temple Followers
  - Linked Members

Message:

"A new event has been announced near you. RSVP now."

 

**Free Event Reminder**

**First Reminder**

Recipients:

All eligible members.

Trigger:

48 hours before event.

 

**Second Reminder**

Recipients:

Confirmed RSVP members only.

Trigger:

12 hours before event.

 

**Third Reminder**

Recipients:

Confirmed RSVP members only.

Trigger:

2 hours before event.

 

**Paid Event Reminder**

**General Reminder**

Recipients:

Eligible members who have not booked tickets.

Trigger:

Every 3 days after publication until 2 days before the event.

Purpose:

Encourage ticket bookings.

 

**Final Reminder**

Recipients:

Members who have purchased tickets.

Trigger:

24 hours before the event.

 

**Event Day Reminder**

Recipients:

Ticket holders only.

Trigger:

2 hours before event start.

Include:

  - Venue
  - QR Ticket
  - Google Maps Link
  - Reporting Time

 

**Event Update Notification**

If any of the following changes:

  - Date
  - Time
  - Venue
  - Cancellation

Recipients:

Only Confirmed RSVP members or Ticket Holders.

 

**Waiting List Promotion**

When a confirmed attendee cancels:

First waiting list member automatically receives:

"Congratulations\! Your RSVP has been confirmed."

 

**Gallery Upload Notification**

Recipients:

Only members marked as **Attended**.

Message:

"Event photos and videos are now available."

 

**Feedback Reminder**

Recipients:

Attended members only.

Trigger:

24 hours after event completion.

 

**53. Business Rules**

**Rule 1**

Every event must belong to a temple or JiNANAM.

 

**Rule 2**

Paid Events can only be created by Super Admin.

 

**Rule 3**

Temple Admins can create unlimited Free Events.

 

**Rule 4**

Completed events cannot be edited by Temple Admins.

Only gallery updates are allowed.

 

**Rule 5**

Only Super Admin can:

  - Delete Events
  - Edit Completed Events
  - Cancel Paid Events
  - Manage Ticket Pricing

 

**Rule 6**

Visibility Engine must apply simultaneously to:

  - Geography
  - Community
  - Temple Followers
  - Linked Members

 

**Rule 7**

QR Tickets become invalid immediately after first successful scan.

 

**Rule 8**

Attendance is marked automatically after QR validation.

 

**Rule 9**

Gallery upload is allowed only after event completion.

 

**Rule 10**

Members can only rate events they actually attended.

 

 

**Rule 11**

Event history should never be permanently deleted. Even if an event is archived, it must remain available in reports and audit logs.

 

**54. Validation Rules**

**Event Creation**

Mandatory:

  - Banner
  - Title
  - Category
  - Description
  - Venue
  - Dates
  - Time
  - Audience Selection
  - Visibility Rules

 

**RSVP**

  - Capacity cannot exceed configured limit.
  - Waiting List activates only after RSVP capacity is reached.
  - Waiting List closes automatically once its limit is reached.

 

**Ticket Booking**

  - Payment must succeed before ticket generation.
  - Seat cannot be double-booked.
  - QR Code must be unique.

 

**Gallery**

  - Maximum 25 images.
  - Unlimited external video links.
  - Supported formats:
      
      - JPG
      - PNG
      - WEBP

 

**Feedback**

  - Only attended members can submit.
  - One feedback submission per member per event.

 

**Security Validation**

  - Role-based access enforced.
  - Audit logs recorded for all create, edit, delete, publish, cancel, and gallery actions.

 

**Recommendation**

I recommend adding an **Event Audit Trail**.

For every event, maintain a complete history of changes, including:

  - Created By
  - Created Date
  - Published By
  - Last Edited By
  - Previous Values → New Values
  - Gallery Uploads
  - Cancellation Reason
  - Policy Updates

This provides transparency, simplifies debugging, and is invaluable for future support and compliance.

**Part 9 of 10**

**Roles, Permissions & Complete Event Management Flow**

 

**55. Role-Based Access**

The Event module should follow Role-Based Access Control (RBAC).

The following users should have access:

  - Super Admin
  - Temple Admin
  - Jain Centre Admin
  - Dharamshala Admin (if permitted)
  - Members
  - Event Check-in Staff (QR Scanner Only)

 

**56. Super Admin Permissions**

Super Admin should have complete control over the Event Module.

Permissions include:

  - Create Free Events
  - Create Paid Events
  - Edit Any Event
  - Delete Any Event
  - Publish/Unpublish Events
  - Cancel Events
  - Configure Event Visibility
  - Configure Categories
  - Configure RSVP Limits
  - Configure Waiting List
  - Configure Ticket Categories
  - Configure Seating Layout
  - Configure Ticket Pricing
  - Configure Refund Policies
  - Upload Event Gallery
  - Generate Reports
  - Download Reports
  - View Analytics
  - Scan Event QR Codes
  - Assign Event to Temple/Jain Centre
  - Archive Events
  - Restore Archived Events

Super Admin should also be able to perform all actions available to other admin roles.

 

**57. Temple Admin Permissions**

Temple Admin should only manage events belonging to their own temple.

Permissions:

  - Create Unlimited Free Events
  - Edit Free Events before completion
  - Upload Event Banner
  - Upload Attachments
  - Configure Event Visibility
  - Configure RSVP Capacity
  - Configure Waiting List
  - View RSVP List
  - Download RSVP Reports
  - View Attendance
  - Upload Event Gallery
  - Upload Video Links
  - View Event Analytics
  - Share Event

Temple Admin **cannot**:

  - Create Paid Events
  - Edit Completed Events
  - Delete Events
  - Configure Ticket Pricing
  - Configure Payment Gateway
  - Process Refunds
  - Modify QR Validation

 

**58. Jain Centre Admin Permissions**

The same permissions as Temple Admin but restricted to events belonging to their own Jain Centre.

 

**59. Dharamshala Admin Permissions**

Optional based on permissions assigned by the Super Admin.

If enabled:

  - Create Free Events
  - Manage Own Events
  - Upload Gallery
  - View Reports

No Paid Event permissions.

 

**60. Event Check-in Staff**

Dedicated QR Scanner access.

Permissions:

  - Login
  - Scan Tickets
  - Validate QR
  - Mark Attendance
  - View Ticket Status

No access to:

  - Edit Events
  - Reports
  - Payments
  - Member Details
  - Analytics

 

**61. Member Permissions**

Members should be able to:

  - View Events
  - Search Events
  - Filter Events
  - RSVP
  - Join Waiting List
  - Purchase Tickets
  - View QR Ticket
  - View Event Gallery
  - Submit Feedback
  - Save Event
  - Share Event
  - View Event History
  - Download Ticket
  - Download Attachments

Members should **not**:

  - Edit Events
  - Upload Gallery
  - View RSVP List
  - View Analytics
  - Delete Events

 

**62. Event Creation Workflow**

Free Event

Temple Admin

↓

Enter Event Details

↓

Select Category

↓

Select Visibility

↓

Configure RSVP

↓

Upload Banner

↓

Upload Attachments

↓

Publish

↓

Notifications Sent

↓

RSVP Opens

 

Paid Event

Super Admin

↓

Create Event

↓

Assign Temple

↓

Configure Ticket Categories

↓

Configure Seating

↓

Configure Payment

↓

Configure Refund Policy

↓

Publish

↓

Bookings Open

↓

QR Generated

↓

Attendance

↓

Gallery

↓

Archive

 

**63. Event Edit Rules**

Before Event Starts

Temple Admin may edit:

  - Title
  - Description
  - Venue
  - Time
  - Banner
  - Attachments
  - Visibility

Notification should be sent to all RSVP members for important changes.

 

During Event

Editable:

  - Gallery (Not Yet)
  - Minor Instructions
  - Contact Details

Not Editable:

  - Event Date
  - Event Type
  - Ticket Pricing

 

After Completion

Temple Admin may only:

  - Upload Photos
  - Upload Video Links

Everything else becomes locked.

Only Super Admin may unlock.

 

**64. Event Cancellation Flow**

Only Super Admin may cancel an event.

Steps:

Cancel Event

↓

Reason Mandatory

↓

Notify Members

↓

Notify Ticket Holders

↓

Display Refund Policy

↓

Mark Event Cancelled

↓

Archive

Temple Admin cannot cancel a completed event.

 

**65. Waiting List Flow**

RSVP Capacity Full

↓

Member selects Join Waiting List

↓

Added to Queue

↓

Cancellation Occurs

↓

First Waiting Member Promoted

↓

Automatic Notification Sent

↓

RSVP Confirmed

The queue should always follow First-In-First-Out (FIFO).

 

**66. Event Gallery Flow**

Once event status changes to Completed:

Temple Admin may upload:

  - Maximum 25 Images
  - Unlimited Google Drive Links
  - Unlimited YouTube Links

Members:

  - View Gallery
  - View Videos
  - Share Event

Downloads should not be permitted.

 

**67. Event Feedback Flow**

Attendance Confirmed

↓

Feedback Notification

↓

Member Rates Event

↓

Comment

↓

Submit

↓

Admin Dashboard Updated

Only attended members should be able to submit feedback.

 

**68. Event History**

Temple Admin should maintain permanent records of:

  - Upcoming Events
  - Active Events
  - Completed Events
  - Cancelled Events
  - Archived Events

Members should only see:

  - RSVP History
  - Ticket History
  - Attended Events
  - Past Galleries

 

**69. Search & Filters**

Admins

Search by:

  - Event ID
  - Event Name
  - Category
  - Temple
  - City
  - Date
  - Status

Members

Search by:

  - Event Name
  - Temple
  - Category
  - City
  - Upcoming
  - Nearby

 

**70. Dashboard Widgets**

Temple Admin Dashboard

Display:

  - Total Events
  - Upcoming
  - Live
  - Completed
  - RSVP Count
  - Attendance
  - Waiting List
  - Gallery Uploaded
  - Average Rating

Super Admin Dashboard

Display:

  - Total Events
  - Paid Events
  - Free Events
  - Revenue
  - Tickets Sold
  - Total Attendance
  - Top Performing Events
  - Top Cities
  - Top Categories

 

**Part 10 of 10**

**Notifications, Reports, Business Rules & Final Flow**

 

**71. Notification Engine**

The Event module should automatically trigger notifications based on the event lifecycle and member interactions.

Notifications should be delivered through:

  - In-App Notifications
  - Push Notifications
  - Email (where applicable)

The notification engine should support scheduling and automatic execution.

 

**72. Notification Trigger Matrix**

**Event Published**

Recipients:

  - Eligible members based on:
      
      - Country
      - State
      - District
      - City
      - Area
      - GPS Location
      - Temple Followers
      - Linked Members

Message:

A new event has been published. RSVP now.

 

**RSVP Confirmation**

Recipients:

Member

Notification:

Your RSVP has been successfully confirmed.

 

**Waiting List Confirmation**

Recipients:

Member

Notification:

You have been added to the waiting list.

 

**Waiting List Promotion**

Recipients:

Member

Notification:

A seat has become available. Your RSVP is now confirmed.

 

**Paid Ticket Confirmation**

Recipients:

Member

Notification should include:

  - Event Name
  - Ticket Count
  - QR Code
  - Booking ID

 

**Event Updated**

If any of the following changes:

  - Date
  - Time
  - Venue

Recipients:

  - RSVP Members
  - Ticket Holders

Notification:

Event details have been updated.

 

**Free Event Reminder**

**Reminder 1**

48 Hours Before

Recipients:

All eligible members.

 

**Reminder 2**

12 Hours Before

Recipients:

RSVP Members only.

 

**Reminder 3**

2 Hours Before

Recipients:

RSVP Members only.

 

**Paid Event Reminder**

**Reminder 1**

Every 3 days after event publication until 2 days before the event.

Recipients:

Eligible members who have not booked tickets.

 

**Reminder 2**

24 Hours Before

Recipients:

Ticket Holders.

 

**Reminder 3**

2 Hours Before

Recipients:

Ticket Holders.

 

**Event Gallery Uploaded**

Recipients:

Only members marked as **Attended**.

 

**Feedback Reminder**

24 Hours After Event Completion

Recipients:

Attended Members.

 

**Event Cancelled**

Recipients:

  - RSVP Members
  - Ticket Holders

Include:

  - Cancellation Reason
  - Refund Policy (if applicable)

 

**73. Event Status Lifecycle**

Every event should follow the lifecycle below.

Draft

↓

Published

↓

RSVP Open / Ticket Sales Open

↓

Live

↓

Completed

↓

Gallery Uploaded

↓

Archived

Business Rules:

  - Draft events are visible only to the creator.
  - Published events become visible based on the Visibility Engine.
  - Completed events cannot be edited by Temple Admin.
  - Archived events remain available for reports and historical records.

 

**74. Reports**

Temple Admin and Super Admin should have access to comprehensive reports.

**Event Summary Report**

Display:

  - Event ID
  - Event Name
  - Event Type
  - Category
  - Temple/Jain Centre
  - Location
  - Event Dates
  - Status

 

**RSVP Report**

Display:

  - JiNANAM Member ID
  - Member Name
  - City
  - State
  - Number of Attendees
  - RSVP Date
  - RSVP Status

 

**Attendance Report**

Display:

  - Ticket ID (Paid Events)
  - Member Name
  - Check-In Time
  - Attendance Status
  - QR Scan Time

 

**Ticket Sales Report (Paid Events)**

Display:

  - Booking ID
  - Ticket Category
  - Quantity
  - Total Amount
  - Payment Status
  - Booking Date

 

**Revenue Report (Super Admin)**

Display:

  - Total Revenue
  - Tickets Sold
  - Refunds (if applicable)
  - Net Revenue

 

**Gallery Report**

Display:

  - Number of Images Uploaded
  - Number of Video Links
  - Upload Date
  - Uploaded By

 

**Feedback Report**

Display:

  - Average Rating
  - Total Responses
  - Comments
  - Rating Distribution

 

**Analytics Dashboard**

Display:

  - Event Views
  - RSVP Count
  - Waiting List Count
  - Ticket Sales
  - Attendance
  - Notification Delivery
  - Notification Open Rate
  - Website/Attachment Clicks
  - Shares
  - Gallery Views

 

Export Options:

  - PDF
  - Excel
  - CSV

 

**75. Search & Filters**

**Admin Search**

Search by:

  - Event ID
  - Event Name
  - Temple
  - Jain Centre
  - Category
  - Event Type
  - City
  - Status

 

**Member Search**

Search by:

  - Event Name
  - Temple
  - Category
  - City

 

**Filters**

  - Free Events
  - Paid Events
  - Upcoming
  - Live
  - Completed
  - Cancelled
  - Nearby
  - Home City
  - Category
  - Date Range

Multiple filters should work together.

 

**76. Business Rules**

  - Paid Events can only be created by the Super Admin.
  - Temple Admins and Jain Centre Admins can create unlimited Free Events.
  - Every event must belong to a Temple or Jain Centre.
  - Event visibility must always follow the JiNANAM Visibility Engine.
  - Members should receive event notifications based on both their Profile Address and Current GPS Location.
  - Community-based visibility should apply where configured.
  - RSVP capacity and waiting list limits should be configurable for every event.
  - Waiting list should follow First-In-First-Out (FIFO).
  - QR Tickets must be unique and cannot be reused after successful check-in.
  - Only attended members should receive gallery upload notifications and be allowed to submit feedback.
  - Temple Admins cannot edit completed events except for uploading galleries.
  - Super Admin has complete control over all events, including editing, deleting, restoring, cancelling, and archiving.
  - All event records, reports, galleries, feedback, and attendance history should remain permanently stored for audit and reporting purposes.
  - Multiple MS profiles can be linked to a single event.
  - The same MS can be linked to multiple events.
  - Any changes to the linked MS profile should automatically reflect in the Event.
  - Linking or removing an MS from an event should automatically update the corresponding MS Profile.
  - Only authorized Admins and the Super Admin can manage linked MS information.

 

**77. Integration Requirements**

The Event module should integrate with:

  - JiNANAM Member Management
  - Temple Management
  - Jain Centre Management
  - Notification Engine
  - Payment Gateway
  - QR Code Engine
  - Visibility Engine
  - Reports Module
  - Gallery Module
  - Support Ticket Module (for Paid Event Requests)

All integrations should be reusable across other JiNANAM modules.

 

**78. Future Ready**

The module should be designed so that the following features can be added in the future without major redevelopment:

  - Live Event Streaming
  - Live Attendance Dashboard
  - Volunteer Management
  - Sponsor Management
  - Multi-Day Event Scheduling
  - Session-wise Registration
  - Digital Certificates
  - Event Merchandise
  - Food Coupon Management
  - Parking Pass Management
  - AI-powered Event Recommendations

 

**79. Notes**

  - Reuse the JiNANAM Visibility Engine across all event types to maintain consistency.
  - Reuse the Notification Engine for scheduled reminders and updates.
  - Use the existing QR Code Engine for ticket generation and attendance validation.
  - Design all event categories, capacities, notification timings, and visibility settings to be configurable rather than hardcoded.
  - Ensure that all event history, reports, and analytics remain permanently available for future reference.
  - Optimize the module to support multiple events running simultaneously across different cities, states, countries, temples, and Jain Centres.

 

**80. Module Completion Summary**

The Event Management Module should provide a complete end-to-end solution covering:

**Free Events**

  - Event Creation
  - Geo & Community-Based Visibility
  - RSVP Management
  - Waiting List
  - Notifications
  - Gallery Management
  - Feedback
  - Reports

**Paid Events**

  - Ticket Categories
  - Seat Management
  - QR Ticket Generation
  - Online Payment
  - Ticket Validation
  - Attendance Tracking
  - Revenue Reports
  - Gallery Management
  - Analytics

**Common Features**

  - Visibility Engine
  - Notification Engine
  - Search & Filters
  - Reports & Analytics
  - Deep Link Sharing
  - Permanent Event History
  - Role-Based Access Control
  - Super Admin Control
  - Future Scalability

 

 

  
  

# Tours  

# **Tours Management for ADMINS**

## **Purpose**

The Tours module allows Temple, Jain Centre, Dharamshala, Stanak, or Community Page Admins to organize and manage **group tours and pilgrimages** for JiNANAM members.

Examples:

  - Palitana Yatra
  - Girnar Yatra
  - Sammed Shikharji Yatra
  - Shatrunjay Yatra
  - Rajasthan Jain Tour
  - South India Jain Tour
  - International Jain Tour
  - Community Tour
  - Picnic
  - Spiritual Tour
  - Other

  

# **1. Tour Creation**

Admin should be able to create a Tour by entering:

  - Tour Title
  - Tour Category
  - Cover Image
  - Description
  - Start Date
  - End Date
  - Registration Start Date
  - Registration End Date
  - Meeting Point
  - Destination
  - Tour Organizer
  - Contact Person
  - Contact Number
  - Maximum Participants
  - Waiting List Limit
  - Tour Status
      
      - Upcoming
      - Ongoing
      - Completed
      - Cancelled

  

# **2. Visibility**

Use the same Visibility Engine as Events.

Admin can choose:

  - Entire Country
  - State
  - City
  - Area
  - Linked Members
  - Followers
  - Community
  - Sub Community
  - Gaccha (if applicable)

Members should only see tours applicable to them.

  

# **3. Tour Type**

Admin selects:

  - Free Tour
  - Paid Tour

If Paid Tour:

Display message:

Please contact JiNANAM Office to create paid tours.

Raise Support Ticket.

Only Super Admin can create Paid Tours.

  

# **4. Registration**

Members can:

  - View Tour Details
  - Register
  - Cancel Registration (if allowed)

Registration should include:

  - Member ID
  - Name
  - Mobile
  - Emergency Contact
  - Number of Participants

Option to add additional JiNANAM Member IDs.

The system should automatically fetch member details.

  

# **5. Capacity Management**

Admin should set:

  - Maximum Participants
  - Waiting List Capacity

Example:

100 Participants

20 Waiting List

If both are full,

Registration automatically closes.

  

# **6. Tour Details**

Admin should add:

  - Day-wise Itinerary
  - Departure Time
  - Return Time
  - Pickup Points
  - Drop Points
  - Important Instructions
  - Things to Carry
  - Dress Code
  - Medical Instructions
  - Emergency Contacts

  

# **7. Linked MS (Optional)**

Admin can link one or multiple MS Profiles.

Display in Tour:

  - MS Name
  - Photo

The linked tour should automatically appear in the MS Profile under:

**Associated Tours**

  

# **8. Notifications**

Members receive:

  - Tour Published
  - Registration Confirmed
  - Tour Reminder
  - Schedule Changes
  - Tour Cancelled
  - Tour Completed

Admins receive:

  - New Registration
  - Registration Cancelled
  - Tour Started
  - Tour Completed

  

# **9. Communication**

Admin should be able to send announcements only to registered tour members.

Supported:

  - Text
  - Images
  - PDF
  - Links

  

# **10. Gallery**

After completion,

Admin can upload:

  - Maximum 25 Photos
  - Unlimited Video Links
  - Google Drive Links

Registered members receive notification when the gallery is published.

  

# **11. Reports**

Admin should download:

  - Registered Members
  - Waiting List
  - Attendance
  - Tour Summary
  - City-wise Report
  - Age-wise Report
  - Male/Female Ratio

Export:

  - Excel
  - PDF

  

# **12. Member App**

Members should be able to:

  - View Tour Details
  - Register
  - View Registration Status
  - View Tour Instructions
  - View Itinerary
  - Contact Organizer
  - View Gallery
  - View Past Tours

  

# **13. Tour History**

Admin:

View all tours:

  - Upcoming
  - Ongoing
  - Completed
  - Cancelled

Members:

View only:

  - Registered Tours
  - Completed Tours

History should remain permanently.

# **14. Business Rules**

  - Same visibility engine as Events.
  - Only registered members should receive tour announcements.
  - Waiting List should automatically activate after participant capacity is reached.
  - Paid Tours can only be created by the Super Admin.
  - Members should be linked using JiNANAM Member ID.
  - Tour history should never be deleted.
  - After the tour is completed, only the gallery can be edited. Tour details become read-only.
  - Super Admin has complete control to create, edit, delete, or manage any tour.

  

# **ð¡ Super Admin Tour Management**

The Super Admin should have complete control over the Tours module and should be able to create tours either on behalf of any organization or directly under JiNANAM.

## **Tour Ownership**

While creating a tour, the Super Admin should choose one of the following options:

### **1. JiNANAM Official Tour**

The tour is organized directly by JiNANAM.

The Super Admin manages:

  - Tour Details
  - Registrations
  - Communications
  - Reports
  - Gallery
  - Payments (if applicable) (link payment gateway)

  

### **2. Create Tour on Behalf of an Organization**

The Super Admin can select any registered organization, such as:

  - Temple
  - Jain Centre
  - Dharamshala
  - Stanak
  - Community Page

Once selected:

  - The tour is automatically linked to that organization.
  - The respective Admin can view and manage the tour (based on permissions granted by the Super Admin).
  - The Super Admin retains full control and can edit, modify, or delete the tour at any time.

  

## **Linked Organization**

Every tour should clearly display:

  - Organized By
      
      - JiNANAM Foundation
      - Temple Name
      - Jain Centre Name
      - Dharamshala Name
      - Stanak Name
      - Community Page Name

This information should be visible on both the Admin Portal and the Member App.

  

## **Super Admin Permissions**

The Super Admin should have permission to:

  - Create, Edit, Delete, or Cancel any tour.
  - Transfer tour ownership to another organization if required.
  - Link one or more organizations as supporting partners.
  - Link one or more MS profiles to the tour.
  - Override participant limits and waiting lists.
  - Manage registrations, reports, galleries, and announcements.
  - Access complete analytics for every tour across the platform.

  

## **Tour Visibility**

For JiNANAM Official Tours, the Super Admin should be able to choose the visibility using the same Visibility Engine:

  - Global
  - Country
  - State
  - City
  - Area
  - Community
  - Sub-Community
  - Gaccha
  - Linked Members
  - Followers of selected organizations

This ensures that official JiNANAM tours can be promoted to the appropriate audience.

  

## **Business Rule**

The Super Admin has unrestricted access to the Tours module and may create tours either independently under the **JiNANAM Foundation** or on behalf of any registered organization. Regardless of who owns the tour, the Super Admin always retains complete administrative control over the tour, registrations, communications, reports, galleries, and participant management.

  

### **⭐ Additional**

Add an optional field called **Supporting Organizations**.

This allows multiple organizations to be associated with the same tour.

Example:

**Organized By:** JiNANAM Foundation

**In Association With:**

  - Shree Adinath Jain Derasar, Mumbai
  - Shree Jain Centre, Ahmedabad
  - Palitana Sangh Trust

These organizations would be displayed on the tour page, allowing collaborative events without duplicating tour records. This is a common requirement for large community yatras and will make the Tours module much more flexible in the future.

  
  

# 99 Management  

**Module: 99 Management**

**Part 1 of 4**

 

**1. Create New 99 Tour**

Only authorized admins should be able to create a new 99 Tour.

During tour creation, the admin should configure the complete tour details.

**Tour Information**

Fields:

  - Tour Name
  - Tour Type
      
      - Palitana 99 Yatra
      - Palitana Taleti 99 Yatra
      - Palitana Babulnath 99 Yatra
      - Girnar 99 Yatra
      - Giranar Taleti 99 Yatra
      - Sammed Shikharji 99 Yatra
      - Sammed Shikharji Taleti 99 Yatra
      - Other
      - Text box for other

  

  - Under which MS - Link MS (Option to link multiple MS)
  - Main Sponsor - Links Members (option to link member)
  - Start Date
  - End Date
  - Tour Duration (Auto Calculate)
  - Location
  - Description
  - Dharamshala - Link Dharamshala via ID
  - Cover Image
  - Logo

 

**Total Jatra Target**

The admin should define the total number of Jatras for the tour.

Examples:

  - 99
  - 108
  -   

**Business Rule**

Once the first member is added to the tour, this value becomes locked and cannot be changed by the Tour Admin.

Only Super Admin can modify it later if required.

 

**Tour Status**

Every tour should have the following lifecycle:

  - Draft
  - Active
  - Ongoing
  - Completed
  - Archived

 

**2. Link Monk & Monk Group**

Every tour should be associated with the monk under whose guidance the Yatra is being organized.

**Primary Monk**

Admin selects:

  - Monk Name (Search using JiNANAM Monk ID)
  - Monk Photo (Auto Fetch)
  - Monk Details (Auto Fetch)

 

**Monk Group**

If the monk belongs to a group,

Admin should also link:

  - Monk Group Name
  - MS Group Leader
  - Supporting Monks

This information should be visible to all members and parents.

Display:

**This 99 Yatra is being organized under the guidance of:**

Monk Name

Monk Group

Temple/Trust

 

**3. Sponsor Management**

Every tour may have multiple sponsors.

Admin should be able to create unlimited sponsor entries.

Each sponsor should contain:

  - Sponsor Name
  - JiNANAM Member ID
  - Sponsor Category
  - Description
  - Amount (Optional)

 

**Sponsor Categories**

Examples:

  - Accommodation
  - Meals
  - Transport
  - Medical
  - Water
  - Snacks
  - General Sponsor
  - Event Sponsor
  - Other (please specify)

Multiple sponsors can be linked to the same category.

 

**4. Create 99 Group**

After creating the tour,

Admin should create the participating group.

The system should display:

  - Tour Name
  - Tour Duration
  - Total Jatra Target

Members will then be added to this group.

 

**5. Add Members**

Members should always be added using their JiNANAM Member ID.

Admin enters:

JiNANAM Member ID

or searches by

Name / Mobile Number.

Once selected,

System automatically fetches:

  - Name
  - Profile Photo
  - Age
  - Gender
  - Mobile Number
  - City
  - State
  - Blood Group
  - Medical Details
  - Emergency Contact
  - Existing Parent (if linked)

No manual entry should be required.

 

**6. Parent Linking**

Each participant may have one parent linked.

The parent must also be a registered JiNANAM Member.

Admin selects:

Parent JiNANAM Member ID

System automatically fetches:

  - Parent Name
  - Mobile Number
  - Relationship
  - Photo

Parents receive read-only access to all tour updates.

 

**7. Medical Information**

Medical information should be collected from every participant before the tour starts.

Members should complete a medical form in the JiNANAM App.

The medical form should include:

  - Blood Group
  - Allergies
  - Existing Medical Conditions
  - Current Medications
  - Emergency Contact
  - Emergency Contact Number
  - Doctor Name (Optional)
  - Doctor Contact (Optional)
  - Special Instructions

The completed form should be visible only to:

  - Tour Admin
  - Super Admin

This information should not be visible to other members.

 

**8. Member Dashboard (Admin)**

Once members are added,

Admin should see a participant dashboard.

Display:

  - Total Members
  - Male
  - Female
  - Parents Linked
  - Medical Forms Pending
  - Medical Forms Completed
  - Total Jatra Target
  - Tour Start Date
  - Tour End Date

 

**9. Communication**

A dedicated communication section should be available for every tour.

The admin can post:

Text Messages only.

(No images, videos or PDFs.)

Examples:

  - Tomorrow's reporting time
  - Schedule changes
  - Food arrangements
  - Safety instructions
  - Temple updates
  - Daily announcements

Messages should be arranged in chronological order.

 

**Communication Notification**

Whenever a communication is posted,

Notifications should be sent to:

  - All Members
  - Linked Parents

 

**Communication History**

All communications should remain permanently available for:

  - Members
  - Parents
  - Tour Admin

They should not be deleted even after tour completion.

 

**10. Daily Tour Schedule**

Admin should have the option to publish the schedule for each day of the tour.

Example:

Day 15

  - Wake-up: 5:00 AM
  - Breakfast: 7:00 AM
  - Yatra Start: 8:00 AM
  - Lunch: 12:30 PM
  - Pravachan: 4:00 PM
  - Dinner: 7:00 PM

This schedule should be visible to:

  - Members
  - Linked Parents

 

**11. Notifications**

The system should automatically send notifications for:

**Tour Created**

Recipients:

  - Members
  - Parents

 

**Member Added**

Recipients:

  - Member
  - Parent

 

**Tour Started**

Recipients:

  - Member
  - Parent

 

**Communication Posted**

Recipients:

  - Member
  - Parent

 

**Daily Schedule Published**

Recipients:

  - Member
  - Parent

 

**Tour Completed**

Recipients:

  - Member
  - Parent

 

**Part 2 of 4**

**Accommodation Management**

 

**12. Accommodation Setup**

Every 99 Tour may have one or multiple accommodation locations during the journey.

The Tour Admin should be able to create and manage all accommodation details before and during the tour.

For each accommodation, the following details should be added:

  - Accommodation Name
  - Building Name
  - Wing Name (if applicable)
  - Floor Number
  - Room Number
  - Room Type (Standard, Hall, VIP, Other)
  - Maximum Capacity
  - Current Occupancy (Auto Calculate)
  - Address
  - Contact Person
  - Contact Number
  - Check-in Date
  - Check-out Date
  - Remarks (Optional)

The system should support multiple accommodation locations for the same tour.

 

**13. Room Creation**

Once accommodation is created, the admin should create individual rooms.

Each room should include:

  - Room Number
  - Building
  - Wing
  - Floor
  - Maximum Capacity
  - Current Occupancy (Auto)
  - Room Status
      
      - Available
      - Full
      - Reserved
      - Under Maintenance (Optional)

The system should automatically prevent room allocation beyond the configured capacity.

 

**14. Room Allocation**

The admin should assign members to rooms using their JiNANAM Member ID.

The system should display:

  - Member Name
  - Photo
  - Gender
  - Age

The admin selects the room, and the member is assigned.

The room occupancy count should update automatically.

 

**Room Allocation Rules**

The system should:

  - Prevent allocation beyond room capacity.
  - Prevent duplicate room allocation.
  - Allow one active room allocation per member at any point in time.
  - Automatically update occupancy when a member is moved.

 

**15. Room Change**

During the tour, members may be shifted to another room.

The admin should be able to change the room allocation at any time while the tour is active.

Whenever a room is changed:

The system should automatically record:

  - Previous Building
  - Previous Wing
  - Previous Room
  - New Building
  - New Wing
  - New Room
  - Date & Time
  - Changed By
  - Reason (Optional)

No historical room allocation should ever be deleted.

 

**16. Room History**

Every participant should have a permanent room history.

Example:

Palitana Tour

Day 1–8

Building A

Wing 1

Room 101

↓

Day 9–20

Building B

Wing 2

Room 208

↓

Day 21–45

Building C

Wing 1

Room 305

The complete accommodation history should remain available permanently.

 

**17. Roommate View**

Members should be able to view the details of their current accommodation.

Display:

  - Building Name
  - Wing
  - Floor
  - Room Number
  - Room Capacity
  - Current Occupancy

Also display:

**Roommates**

  - Member Name
  - Profile Photo

No personal details should be displayed.

Parents should also be able to view their child's accommodation details in read-only mode.

 

**18. Accommodation Dashboard**

The Tour Admin dashboard should display:

  - Total Accommodation Locations
  - Total Buildings
  - Total Rooms
  - Available Rooms
  - Full Rooms
  - Total Members Allocated
  - Members Without Room Allocation

Quick actions:

  - Create Accommodation
  - Create Room
  - Allocate Members
  - Change Room
  - View Room History
  - Download Reports

 

**19. Accommodation Notifications**

Whenever accommodation details are updated, notifications should be sent.

**Room Assigned**

Recipients:

  - Member
  - Linked Parent

Display:

  - Building
  - Wing
  - Floor
  - Room Number

 

**Room Changed**

Recipients:

  - Member
  - Linked Parent

Display:

Previous Room

↓

New Room

 

**Accommodation Updated**

If accommodation location changes,

All members and parents should receive an updated notification.

 

**20. Daily Tour Schedule**

The Tour Admin should publish a daily schedule for each day of the tour.

Each schedule should contain:

  - Wake-up Time
  - Breakfast Time
  - Yatra Start Time
  - Lunch Time
  - Pravachan
  - Evening Activities
  - Dinner Time
  - Important Instructions

Only text updates are required.

Members and parents should receive notifications whenever a new daily schedule is published.

 

**21. Communication History**

All communications and schedules should remain permanently stored.

Members, parents, and admins should be able to browse communication history day-wise.

Example:

Day 1

↓

Day 2

↓

Day 3

↓

...

↓

Day 45

 

**Part 3 of 4**

**Daily Jatra Management & Member Progress**

 

**22. Daily Jatra Entry**

This is the core functionality of the 99 Management module.

Every day, the Tour Admin should record the number of Jatras completed by each participant.

The admin should enter:

Today's Jatra Count

Example:

Member A

Today's Jatra = 4

The system should automatically calculate:

Previous Total = 40

Today's Count = 4

New Total = 44

The admin should never manually enter the cumulative total.

 

**23. Bulk Daily Entry**

To simplify daily operations, the admin should be able to update all participants from a single screen.

Display:

Room 101

↓

Member 1

Today's Jatra [+]

↓

Member 2

Today's Jatra [+]

↓

Member 3

Today's Jatra [+]

↓

Member 4

Today's Jatra [+]

The system automatically saves and recalculates progress.

This significantly reduces manual work.

 

**24. Attendance Management**

Attendance should be derived from the daily Jatra entry.

The admin should choose one status for each participant.

Options:

  - Present
  - Absent
  - Not Well

Rules:

Present

Today's Jatra must be greater than zero.

Absent

Today's Jatra should be zero.

Not Well

Today's Jatra should be zero.

Reason should be optional.

Attendance reports should be generated automatically.

 

**25. Progress Tracking**

Each member should have a live progress tracker.

Example:

Target

99 Jatras

Completed

44

Remaining

55

Progress

44%

The progress bar should update automatically after every daily entry.

 

**26. Daily History**

Members should be able to view complete day-wise history.

Example:

Day 1

4 Jatras

↓

Day 2

2 Jatras

↓

Day 3

5 Jatras

↓

...

↓

Day 45

3 Jatras

The history should remain permanently available.

 

**27. Parent View**

Parents should have read-only access to:

  - Daily Jatra Count
  - Total Completed
  - Progress Percentage
  - Attendance Status
  - Accommodation
  - Communication
  - Daily Schedule
  - Medical Information (View Only)

Parents cannot edit any data.

 

**28. Member App**

The participant should have a dedicated section:

**My 99 Management**

Display:

  - Tour Name
  - Tour Location
  - Monk
  - Total Target
  - Total Completed
  - Remaining
  - Progress Bar
  - Current Room
  - Tour Duration

Tabs:

  - Daily Progress
  - Accommodation
  - Communication
  - Schedule
  - Medical Details
  - Certificate (after completion)

 

**29. Notifications**

Members and linked parents should receive notifications for:

  - Daily Jatra Updated
  - Progress Milestone Reached
  - Room Changed
  - Schedule Updated
  - Communication Posted
  - Tour Started
  - Tour Completed
  - Certificate Generated

 

**30. Progress Milestones**

The system should automatically notify members when they achieve important milestones.

Example:

25%

50%

75%

100%

Upon reaching 100%, the member should receive:

**Congratulations\! You have successfully completed your target of 99/108 Jatras for this tour. Your certificate is now available.**

The same notification should also be sent to the linked parent.

 

**31. Tour Timeline**

Every member should have a complete timeline of their journey.

Example:

Tour Joined

↓

Room Allocated

↓

Daily Jatra Progress

↓

Room Changed (if applicable)

↓

Target Completed

↓

Certificate Generated

↓

Tour Completed

This timeline should remain permanently accessible within the member's tour history.

 

**Part 4 of 4**

 

**32. Reports**

The Tour Admin and Super Admin should be able to download comprehensive reports for every 99 Tour. All reports should remain available permanently, even after the tour has been completed.

**Tour Summary Report**

The report should include:

  - Tour Name
  - Tour Type
  - Location
  - Start Date
  - End Date
  - Total Duration
  - Monk Name
  - Monk Group
  - Total Members
  - Total Parents Linked
  - Total Sponsors
  - Total Target Jatras
  - Tour Status

 

**Member Report**

Display:

  - JiNANAM Member ID
  - Member Name
  - Parent Name
  - Mobile Number
  - Current Room
  - Total Jatras Completed
  - Attendance Status
  - Progress Percentage
  - Certificate Status

 

**Parent Report**

Display:

  - Parent JiNANAM ID
  - Parent Name
  - Member Name
  - Mobile Number
  - Relationship

 

**Accommodation Report**

Display:

  - Building Name
  - Wing
  - Floor
  - Room Number
  - Room Capacity
  - Current Occupancy
  - Members Staying
  - Room Change History

 

**Daily Jatra Report**

Display:

  - Date
  - Member Name
  - Today's Jatra Count
  - Total Completed
  - Remaining
  - Attendance Status

  

## **Daily Jatra Progress**

The Admin should update every member's Jatra progress on a **daily basis** throughout the duration of the tour.

### **Daily Jatra Entry**

For each day, the Admin should be able to:

  - Select Tour
  - Select Date
  - Search Member by:
      
      - JiNANAM Member ID
      - Member Name
  - Enter Today's Jatra Count

Example:

Date: 15-Aug-2026

Member: JFJM001245

Today's Jatra Completed: **4**

Status:

  - Present
  - Not Well
  - Absent

Optional Remarks

The system should automatically calculate:

  - Previous Total
  - Today's Count
  - Updated Total

Example:

Previous Total: 40

Today's Jatra: 4

Current Total: 44

The Admin should only enter the **daily count**. All cumulative calculations should be performed automatically by the system.

The Admin should be allowed to edit daily entries only until the tour is completed. Once the tour ends, the records should become read-only. Only the Super Admin should have permission to modify archived tour records.

  

## **ð Member Progress (Member App)**

Every member should have a dedicated **My Jatra Progress** section within the Tour.

The member should be able to view:

  - Total Target Jatras (Configured by Admin for that Tour)
  - Total Jatras Completed
  - Remaining Jatras
  - Current Day's Jatra Count
  - Attendance Status
  - Daily Remarks (if any)

### **Progress Bar**

A graphical progress bar should display the member's overall completion status.

Example:

**Target:** 108 Jatras

**Completed:** 44

**Remaining:** 64

**Progress:** 41%

The progress bar should automatically update whenever the Admin enters the daily Jatra count.

  

## **ð¨‍ð©‍ð§ Parent View**

If a parent is linked to the member, the parent should have **read-only access** to the member's tour progress.

The parent should be able to view:

  - Daily Jatra Count
  - Total Jatras Completed
  - Remaining Jatras
  - Progress Bar
  - Attendance Status
  - Room Allocation
  - Daily Communication
  - Tour Updates
  - Emergency Notifications

Parents should not have permission to edit any information.

  

## **ð Notifications**

Whenever the Admin updates a member's daily Jatra count:

The Member should receive:

  - Daily Jatra Updated
  - Today's Count
  - Total Completed
  - Remaining Jatras
  - Updated Progress Percentage

If a parent is linked, the same notification should also be sent to the parent.

  

**Communication Report**

Display all communication posted during the tour.

Fields:

  - Date
  - Time
  - Message
  - Posted By

 

**Sponsor Report**

Display:

  - Sponsor Name
  - Sponsor Category
  - JiNANAM Member ID (if applicable)
  - Contact Person
  - Contact Number
  - Sponsored Item
  - Amount (Optional)

 

**Medical Report**

(Admin & Super Admin Only)

Display:

  - Blood Group
  - Medical Conditions
  - Allergies
  - Current Medication
  - Emergency Contact

 

**Certificate Report**

Display:

  - Member Name
  - Total Target
  - Total Completed
  - Certificate Generated (Yes/No)
  - Certificate Download Date

 

**Export Options**

All reports should support:

  - PDF
  - Excel
  - CSV

 

**33. Certificate Generation**

When a member successfully completes the configured target (99, 108, or any custom target defined for the tour), the system should automatically generate a digital certificate.

The certificate should include:

  - JiNANAM Logo
  - Tour Name
  - Tour Location
  - Member Name
  - JiNANAM Member ID
  - Monk Name
  - Monk Group
  - Total Target
  - Total Completed
  - Completion Date
  - Certificate Number
  - QR Verification Code

The certificate should be:

  - Viewable in the app
  - Downloadable as PDF
  - Permanently available in the member's profile

 

**34. My 99 Management History (Member App)**

Every member should have a dedicated section in **Settings → My 99 Management**.

Each completed tour should be stored separately.

Example:

  - Palitana 99 Yatra – 2026
  - Girnar 108 Yatra – 2027
  - Sammed Shikharji Yatra – 2028

Selecting a tour should display:

  - Tour Information
  - Monk Details
  - Accommodation History
  - Daily Jatra History
  - Attendance History
  - Communication History
  - Progress Summary
  - Certificate

This history should remain available permanently and should not be editable by the member.

 

**35. Parent History**

Parents should also be able to access the completed tour history of the linked participant in read-only mode.

Parents should be able to view:

  - Tour Summary
  - Daily Progress
  - Accommodation History
  - Communication
  - Certificate

No edit permissions should be provided.

 

**36. Tour Completion**

When the configured End Date is reached, the system should automatically mark the tour as **Completed**.

Once completed:

  - Daily Jatra entry should be locked.
  - Attendance editing should be disabled.
  - Communication should become read-only.
  - Room allocation should be locked.
  - Certificates should be generated automatically for eligible members.
  - Reports should remain available permanently.

Only the Super Admin should have permission to modify a completed tour if required.

 

**37. Notifications**

The system should automatically send notifications for the following events.

**Tour Created**

Recipients:

  - Members
  - Linked Parents

 

**Member Added**

Recipients:

  - Member
  - Linked Parent

 

**Tour Started**

Recipients:

  - Members
  - Parents

 

**Daily Schedule Published**

Recipients:

  - Members
  - Parents

 

**Daily Jatra Updated**

Recipients:

  - Member
  - Parent

 

**Room Changed**

Recipients:

  - Member
  - Parent

 

**Communication Posted**

Recipients:

  - Member
  - Parent

 

**Progress Milestones**

Notify at:

  - 25%
  - 50%
  - 75%
  - 100%

Recipients:

  - Member
  - Parent

 

**Certificate Generated**

Recipients:

  - Member
  - Parent

 

**Tour Completed**

Recipients:

  - Member
  - Parent

 

**38. Business Rules**

  - The admin must configure the total target (99, 108, or custom) before adding members.
  - Once the first member is added, the target becomes locked for the entire tour.
  - Only JiNANAM members can participate in a tour.
  - Only JiNANAM members can be linked as parents.
  - Every tour must be linked to a Monk and Monk Group.
  - Multiple sponsors may be linked to a tour.
  - Members may change accommodation during the tour, and all changes must be recorded permanently.
  - Daily Jatra entries should be entered as daily counts only; the system should calculate cumulative totals automatically.
  - Attendance should support **Present**, **Absent**, and **Not Well**.
  - Members achieving the configured target should automatically receive a digital certificate.
  - Tour history should never be deleted and should remain available permanently.
  - Only Super Admin can edit records after the tour has been completed.
  - The Admin should enter only the **daily Jatra count**; cumulative totals should always be calculated automatically by the system.
  - The total target (e.g., **99, 108, or any custom number**) should be configured once during tour creation and remain locked for all participants throughout the tour.
  - Every update should immediately refresh the progress bar for both the member and the linked parent.
  - All daily entries should be permanently stored and displayed in the member's lifetime **Yatra History** after the tour is completed.

 

**39. Future Ready**

The module should be designed so that the following can be added later without major redevelopment:

  - Live GPS Tracking of Tour Groups
  - Bus & Vehicle Management
  - Meal Management
  - Volunteer Assignment
  - Donation Management
  - Expense Tracking
  - Photo Gallery
  - Tour Feedback
  - Digital Attendance using QR

 

**40. Developer Notes**

  - Reuse the JiNANAM Member ID engine for all participant identification.
  - Reuse the existing notification engine used across JiNANAM.
  - Reuse the Visibility Engine where applicable for communication.
  - All reports and histories should be permanent and auditable.
  - Design the module to support multiple 99 Management tours running simultaneously.  

# Community Page Management  

**JiNANAM – Community Pages Management**

The Community Pages module enables Jain organizations, youth groups, trusts, social groups, clubs, and other registered Jain communities to establish their official presence within the JiNANAM platform.

The module should function similarly to an official organization page (similar to LinkedIn Company Pages), allowing organizations to manage their members, communicate with followers, publish updates, organize events, conduct polls, and build engagement within the Jain community.

Only the **Super Admin** can create Community Pages. Page owners can manage/edit only their assigned page and cannot create or delete pages.

 

**1. Community Page Creation**

Community Pages can only be created by the Super Admin.

Navigation:

**Super Admin → Community Pages → Create New Page**

During creation, the Super Admin should assign:

  - Page Name
  - Short Name (Optional)
  - Page Logo
  - Cover Banner
  - Description
  - Category
  - Community Visibility
  - Geographic Visibility
  - Subscription Start Date
  - Subscription Expiry Date
  - Page Owner(s) - Link member

Every page should receive a unique auto-generated Page ID.

Example: **JFCP108**

 

**2. Community Page Categories**

The Super Admin should manage predefined categories.

Examples:

  - Youth Organization
  - Jain Trust
  - Jain Social Group
  - Jain Business Network
  - NGO
  - Educational Institution
  - Religious Organization
  - Women's Group
  - Professional Network
  - Charity Organization
  - Cultural Organization
  - Student Group
  - Other

Categories should remain configurable through the Super-Admin panel.

 

**3. Community Visibility**

The same JiNANAM Visibility Engine should apply.

Community Visibility

Public (Visible to all members)

 

**4. Geographic Visibility**

Community Pages should support location-based discovery.

Visibility Options:

  - Global
  - Country
  - State
  - District
  - City
  - Area

Members should discover Community Pages based on:

  - Registered Profile Address
  - Current GPS Location

The same visibility logic used for Events and Community Feed should apply.

 

**5. Page Profile**

Each Community Page should contain:

  - Page Logo
  - Cover Banner
  - Page Name
  - Short Description
  - Detailed About Section
  - Organization Type
  - Established Year
  - Website
  - Email
  - Contact Number
  - Operates from - Online/Office/Temple/Community
  - Office  Address - (if online then no address and for rest address option.)
  - Google Maps Location
  - Social Media Links
  - Google Form Links (So here they will name the form name and will provide the link, so we just have to provide two text box 1- Google form for 2. Form Link)

 

**6. Join Community**

Every Community Page should display a **Join Community** button.

When a member selects **Join Community**:

  - The member becomes a Community Page Member.
  - The Page Owner receives a notification.
  - The member is added to the Community Member list.

The Page Owner should have the option to:

  - Auto Approve Members
  - Manually Approve Members

This setting should be configurable.

  

**7. Community Members**

The Page Owner should be able to view:

  - Total Members
  - Pending Join Requests
  - Approved Members
  - Rejected Members

Member details should include:

  - JiNANAM Member ID
  - Name
  - City
  - State
  - Community
  - Join Date

**The Page Owner should be able to:**

  - ****Approve****
  - ****Reject****
  - ****Remove Members****

**Members can leave the Community Page at any time.**

 

**8. Community Page Management**

The assigned Page Owner should be able to edit:

  - Logo
  - Cover Banner
  - About
  - Contact Details
  - Gallery (option to upload 10 images only)
  - Social Media Links

The Page Owner should **not** be able to:

  - Delete the Page
  - Change Subscription
  - Change Page Owner
  - Change Geographic Visibility

These permissions remain exclusively with the Super Admin.

 

**9. Community Content**

The Page Owner should be able to publish:

  - Feed Posts
  - Events
  - Polls
  - Notices
  - Announcements

**All content should automatically appear in the JiNANAM Community Feed according to the Visibility Engine.**

 

**10. Events**

The Page Owner should be able to create:

  - Free Events

If the Page Owner selects **Paid Event**, the system should display:

"Paid Events are managed exclusively by the JiNANAM Team. Please raise a Support Ticket to proceed."

A Support Ticket should automatically be generated.

 

**11. Poll Management**

The Page Owner should be able to:

  - Create Poll
  - Edit Poll
  - Close Poll

Poll results should be visible according to the selected settings.

 

**12. Notifications**

Only Community Page Members should receive notifications for:

  - New Feed Posts
  - New Events
  - New Polls
  - Important Announcements
  - Join Request Approved
  - Upcoming Events

The Page Owner should receive notifications for:

  - New Join Requests
  - New Followers
  - Subscription Expiry Reminder

 

**13. Community Feed**

Every Community Page should have its own dedicated feed.

The feed should display:

  - Feed Posts
  - Events
  - Polls
  - Notices
  - Gallery
  - Announcements

Latest content should appear first.

 And there should be track of expired content.

  

**14. Subscription Management**

Community Pages should operate on a subscription model.

Only the Super Admin can manage subscriptions.

Subscription Details:

  - Subscription Start Date
  - Subscription Expiry Date
  - Status

Status Options:

  - Active
  - Expiring Soon
  - Expired
  - Suspended

The system should automatically calculate the remaining subscription period.

 

**15. Subscription Lock**

Once the subscription expires:

The Page Owner should no longer be able to:

  - Login to the Community Page Portal
  - Create Posts
  - Edit Posts
  - Create Events
  - Create Polls
  - Upload Gallery
  - Manage Members

However:

  - The Community Page should remain visible to members.
  - Existing content should remain available.
  - Only management access should be locked.

The Super Admin should retain complete control.

 

**16. Analytics**

The Page Owner should have access to:

  - Total Followers
  - New Members
  - Feed Views
  - Feed Reach
  - Event Registrations
  - Poll Participation
  - Gallery Views
  - Post Engagement
  - Member Growth

The Super Admin should have access to analytics for all Community Pages.

 

**17. Search & Discovery**

Members should be able to search Community Pages by:

  - Organization Name
  - Category
  - City
  - State
  - Community
  - Keywords

Filters:

  - Nearby
  - My Community
  - Recently Added
  - Most Popular
  - Featured

 

**18. Reports**

The Page Owner should be able to export:

  - Community Member List
  - Event Reports
  - Poll Reports
  - Feed Analytics
  - Join Requests
  - Membership Growth

Export Formats:

  - PDF
  - Excel
  - CSV

 

**19. Business Rules**

  - Community Pages can only be created by the Super Admin.
  - Every Community Page should have a unique Page ID.
  - Page Owners can manage only their assigned Community Page.
  - Community Pages should follow the JiNANAM Community Visibility Engine.
  - Geographic Visibility should follow the standard JiNANAM Visibility Engine.
  - All Community content should automatically appear in the JiNANAM Community Feed.
  - Paid Events should only be managed by the JiNANAM Team.
  - Subscription expiry should automatically lock management access while keeping the page publicly visible.
  - Only the Super Admin may delete Community Pages.
  - All changes should be recorded in the audit logs.

 

**20. Future Ready**

The module should support future enhancements without redevelopment, including:

  - Multiple Page Administrators
  - Paid Membership Plans
  - Organization Verification Badge
  - Live Streaming
  - Discussion Forums
  - Resource Library
  - Volunteer Recruitment
  - Donation Campaigns
  - Sponsorship Management
  - Premium Analytics
  - API Integration

 

**Final Note**

The Community Pages module should provide Jain organizations with a secure and professional digital presence within the JiNANAM platform. It should enable organizations to engage with members, publish updates, organize activities, and build long-term community relationships while remaining fully governed through JiNANAM's centralized visibility engine, role-based permissions, and subscription management system.

 

  
  

# News Management  

**JiNANAM – News Management**

The News module provides members with short, informative updates in a simple swipe-based format similar to the Inshorts application. The objective is to deliver important Jain community news, temple updates, announcements, and JiNANAM updates in a quick and engaging reading experience.

All news should be displayed in a dedicated **News** section within the JiNANAM Member App.

 

**1. News Creation**

News can only be created by:

  - Super Admin only

  

Only Super Admin has access to create and manage all news.

Navigation:

**Admin Panel → News Management → Create News**

 

**2. News Information**

Each news article should contain:

  - News Title
  - Short Description
  - Cover Image (Top Image)
  - Bottom Image
  - External Link(s) (Optional)
  - Publish Date
  - Expiry Date
  - Category
  - Breaking News (Yes / No)
  - Featured News (Yes / No)

 

**3. News Categories**

The Super Admin should manage the master list of categories.

Suggested Categories:

  - Temple News
  - Jain Centre News
  - Community News
  - Monk News
  - Events
  - Tours
  - Religious Updates
  - Charity
  - JiNANAM Updates
  - Other

Categories should remain configurable.

 

**4. News Publishing**

Once the news is published:

  - It should immediately become visible in the Member App.
  - Members should receive a notification.
  - The news should automatically appear in the News section.

Maximum News Validity:

**7 Days**

Example:

Published:

1 July

↓

Automatically Expire:

8 July

After expiry:

The news should automatically move to the Archive.

 

**5. Swipe-Based Reading Experience**

The News section should provide a full-screen reading experience similar to Inshorts.

Each news article should display:

  - Cover Image
  - Title
  - Description
  - Bottom Image
  - External Links (if any)

Members should navigate by swiping left or right (or the chosen swipe direction) to move to the next news article.

Once the member reaches the last available news article, the application should automatically restart from the latest active news.

 

**6. News Display Order**

The system should display news in the following priority:

1.  Breaking News
2.  Featured News
3.  Latest Published News
4.  Remaining Active News

Archived news should not appear in the active news feed.

 

**7. Notifications**

Whenever a new news article becomes active:

A Push Notification and In-App Notification should be sent automatically.

Recipients:

**All Jain Members** using the JiNANAM application.

The Community Visibility Engine should **not** apply to this module.

Every Jain member should receive the notification by default.

 

**8. Member Experience**

Members should be able to:

  - Swipe through news
  - Bookmark news
  - Share news
  - Open external links
  - View archived news (optional if enabled)

Members should **not** be able to:

  - Comment
  - Like
  - Edit
  - Delete

The objective is to keep the experience simple and focused on reading.

 

**9. News Sharing**

Members should be able to share news through:

  - WhatsApp
  - Facebook
  - Instagram
  - Telegram
  - Copy Link

All shared links should use JiNANAM Deep Linking.

If the JiNANAM App is installed:

Open the news directly.

Otherwise:

Redirect to the Play Store/App Store and then open the news after installation.

 

**10. Bookmark News**

Members should be able to save news for future reading.

Saved news should appear under:

**Saved News**

Members may remove saved news at any time.

 

**11. Search**

Members should be able to search news using:

  - Title
  - Category
  - Keywords

Search results should update instantly.

 

**12. News Archive**

After the configured expiry date:

The news should automatically become inactive and move to the Archive.

Archived news should remain available for historical reference and reporting.

Admins should not be able to delete archived news.

Only the Super Admin may permanently delete news.

 

**13. Analytics**

The system should automatically maintain:

  - Total Views
  - Total Shares
  - Total Bookmarks
  - Link Clicks
  - Read Count

Analytics should be available to:

  - Respective Admin
  - Super Admin

The Super Admin should have access to analytics across all news.

 

**14. Reports**

Admins should be able to download:

  - News Performance Report
  - View Analytics
  - Share Analytics
  - Bookmark Analytics
  - Category-wise Report
  - Monthly Report
  - Yearly Report

Export Formats:

  - PDF
  - Excel
  - CSV

 

**15. Admin Permissions**

**Super Admin**

  - Create News
  - Edit News
  - Delete News Permanently
  - Archive News
  - Restore Archived News
  - Manage Categories
  - View All Analytics
  - View All Reports

**Temple / Jain Centre Admin**

  - Create News
  - Edit Own News
  - View Own Analytics
  - View Own Reports

Temple / Jain Centre Admins should **not** have permission to:

  - Permanently Delete News
  - Restore Archived News
  - Edit Other Admins' News

 

**16. Business Rules**

  - News can only be created by authorized admins.
  - Every news article should contain a Title and Description.
  - Two images should be supported:
      
      - One Cover Image at the top.
      - One Image at the bottom.
  - Multiple external links may be added.
  - Maximum active duration for a news article is **7 days**.
  - After expiry, the news should automatically move to the Archive.
  - Archived news should remain available unless permanently deleted by the Super Admin.
  - All Jain members should receive notifications for every published news article.
  - The Community Visibility Engine should not apply to this module.
  - Members should only be able to read, bookmark, and share news.
  - Comments and Likes should not be supported.
  - All actions should be recorded in the audit logs.

 

**17. Future Ready**

The News module should support future enhancements without redevelopment, including:

  - AI News Summaries
  - Multi-language News
  - Audio News
  - Video News
  - Live News Ticker
  - Breaking News Banner
  - Scheduled Publishing
  - Push Notification Scheduling
  - News Recommendations
  - Personalized News Categories

 

**Final Note**

The JiNANAM News module should provide a fast, clean, and engaging news-reading experience focused on delivering verified Jain community updates, temple announcements, and official JiNANAM information. The swipe-based interface should encourage quick consumption while maintaining simplicity, consistency, and high user engagement across the platform.

 

  
  

# Super Admin Menu  

# **ð  Dashboard**

  - Dashboard
  - Live Statistics
  - Recent Activities
  - Pending Approvals
  - Alerts
  - Quick Actions

# **ð¥ People**

Everything related to people.

### **Members**

  - Jain Members
  - Non-Jain Members
  - Family Management
  - Volunteers

### **MS**

  - MS Profiles
  - Guru Hierarchy
  - MS Groups
  - MS Route Management
  - Chaturmas
  - Tapasya
  - Associations

### **Staff**

  - Staff Management
  - QR Cards
  - Attendance
  - Leave
  - Documents

# **ð Organizations**

**Everything related to physical organizations.**

### **Temple**

  - Temple Management
  - Committee
  - Volunteers
  - Dhaja
  - Chaturmas
  - Reviews
  - Gallery
  - Notices

### **Jain Centre**

  - Jain Centre Management

### **Dharamshala**

  - Dharamshala Management
  - Rooms
  - Buildings
  - Floors

### **Bhojanshala**

  - Bhojanshala

### **Sthanaks**

  - Sthanaks

### **Community Pages**

  - Community Groups
  - Subscriptions

  

# **ð Activities**

**Everything members interact with.**

  - Feed
  - Events
  - News
  - Announcements
  - Polls
  - Tours
  - 99 Management
  - Spiritual Counter
  - Tithi Calendar

  

# **ð Bookings**

**Everything booking related.**

  - Booking Categories
  - Booking Setup
  - Booking Requests
  - Reservations
  - Calendar

# **ð° Finance**

**Everything involving money.**

  - Donations
  - Receipts
  - Offers
  - Advertisements
  - Sponsors

# **ð Tracking**

**Everything movement related.**

  - GPS Tracking
  - Manual Tracking
  - MS Routes
  - Journey Logs
  - Live Map
  - Chaturmas Tracking

# **ð Reports**

### **People**

  - Member Reports
  - Staff Reports
  - MS Reports

### **Organization**

  - Temple Reports
  - JC Reports
  - Dharamshala Reports

### **Activities**

  - Events
  - Feed
  - News
  - 99
  - Tours

### **Finance**

  - Donations
  - Offers
  - Advertisements

### **Operations**

  - Visitors
  - Bookings
  - Attendance

# **ð« Support**

  - Support Tickets
  - Feedback
  - Incorrect Information
  - Contact Requests

# **⚙️ Masters & Settings**

**Everything configurable.**

### **Master Data**

  - Community
  - Sub Community
  - Gaccha
  - Bhagwan
  - Tapasya
  - Languages
  - Countries
  - States
  - Cities
  - Areas
  - Currencies

### **Categories**

  - Booking
  - Donation
  - Event
  - Offer
  - News
  - Poll
  - Tour

### **Notifications**

  - Templates
  - SMS
  - WhatsApp
  - Email

### **Security**

  - Roles
  - Permissions
  - Audit Logs

### **Platform**

  - Subscription
  - App Settings
  - Home Banners
  - Static Pages
  - FAQs**  
    **

# Admins Menu**  
**

**1. TEMPLE ADMIN (Temple Only)** **  
  
**

ð  Dashboard

    • Today's Summary

    • Pending Tasks

    • Notifications

    • Quick Actions

  

ð Temple Management

    • Temple Profile

    • Temple Gallery

    • Temple Timings

    • Facilities

    • Temple Contacts

    • Trustees & Committee

    • Volunteers

    • Chaturmas Management

    • Dhaja Management

    • Temple Notices

    • Reviews

    • Social Links

  

ð MS Management

    • Linked MS

    • MS Route Creation

    • Incoming MS

    • Outgoing MS

    • Chaturmas

    • Pravachan Schedule

  

ð¥ Members

    • Jain Members

    • Non-Jain Members

    • Volunteers

    • Followers

    • Favourite Members

  

ð¨‍ð¼ Staff Management

    • Staff Directory

    • Staff Registration

    • QR Cards

    • Attendance

    • Leave Management

    • Documents

    • Working Hours

  

ð Events

    • Events

    • Polls

    • Announcements

    • News

    • Community Feed

  

ð Booking Management

    • Booking Categories

    • Booking Items

    • Booking Requests

    • Reservations

    • Booking Calendar

    • Booking Rules

  

ð° Donations

    • Donation Requests

    • Donation Categories

    • Offline Donations

    • Receipts

    • Bank Accounts

    • QR Codes

  

ð£ Visitors

    • Visitor Entry

    • Visitor History

  

ð Reports

    • Members

    • Staff

    • Bookings

    • Donations

    • Events

    • Visitors

    • Volunteers

  

ð« Support

    • Support Tickets

    • Incorrect Information

    • Feedback

  

⚙️ Settings

    • Profile

    • Notification Settings

    • Working Hours

  

**2. DHARAMSHALA ADMIN (Only Dharamshala)** 

ð  Dashboard

  

ð¨ Dharamshala Management

    • Dharamshala Profile

    • Gallery

    • Contact Details

    • Facilities

    • Buildings

    • Floors

    • Rooms

    • Room Categories

    • Amenities

    • Room Pricing

    • Rules

  

ð¥ Members

  

ð¨‍ð¼ Staff Management

  

ð Booking Management

    • Booking Setup

    • Rooms

    • Hall Booking

    • Booking Requests

    • Reservations

    • Calendar

  

ð½ Bhojanshala

    • Timings

    • Booking

    • Pass Management

  

ð° Donations

  

ð£ Visitors

  

ð Reports

  

ð« Support

  

⚙️ Settings

  

**3. TEMPLE + DHARAMSHALA ADMIN** 

**ð  Dashboard**

  

**ð Temple**

  

**ð¨ Dharamshala**

  

**ð MS**

  

**ð¥ Members**

  

**ð¨‍ð¼ Staff**

  

**ð Activities**

    **• Feed**

    **• Events**

    **• Polls**

    **• Announcements**

    **• News**

  

**ð Booking**

  

**ð½ Bhojanshala**

  

**ð° Donations**

  

**ð£ Visitors**

  

**ð Reports**

  

**ð« Support**

  

**⚙️ Settings**

**4. JAIN CENTRE ADMIN** **  
  
**

**ð  Dashboard**

  

**ð¢ Jain Centre**

    **• Profile**

    **• Gallery**

    **• Facilities**

    **• Contact Details**

    **• Committee**

    **• Volunteers**

    **• Notices**

    **• Reviews**

    **• Social Links**

  

**ð MS**

    **• Linked MS**

    **• MS Route Creation**

    **• Incoming MS**

    **• Outgoing MS**

    **• Chaturmas**

  

**ð¥ Members**

  

**ð¨‍ð¼ Staff**

  

**ð Activities**

  

**ð Booking**

  

**ð° Donations**

  

**ð£ Visitors**

  

**ð Reports**

  

**ð« Support**

  

**⚙️ Settings**

**  
****5. JAIN CENTRE + DHARAMSHALA** **  
****ð  Dashboard**

  

**ð¢ Jain Centre**

  

**ð¨ Dharamshala**

  

**ð MS**

  

**ð¥ Members**

  

**ð¨‍ð¼ Staff**

  

**ð Activities**

  

**ð Booking**

  

**ð½ Bhojanshala**

  

**ð° Donations**

  

**ð£ Visitors**

  

**ð Reports**

  

**ð« Support**

  

**⚙️ Settings**

**  
****6. MS ADMIN (Monk Management Only)** 

**ð  Dashboard**

    **• Today's Updates**

    **• Upcoming Route**

    **• Notifications**

  

**ð MS Profile**

    **• Basic Details**

    **• Biography**

    **• Guru Parampara**

    **• Group Details**

    **• Family**

    **• Gallery**

    **• Tapasya**

    **• Timeline**

    **• Associations**

  

**ð¶ JiNANAM**

    **• Current Location**

    **• Route Creation**

    **• Journey History**

    **• Upcoming Route**

    **• Linked Temples**

    **• Linked Jain Centres**

  

**ð Chaturmas**

    **• Current Chaturmas**

    **• Upcoming**

    **• History**

  

**ð Activities**

    **• Feed**

    **• Announcements**

    **• Pravachan Schedule**

    **• Events**

    **• Polls**

  

**ð¥ Followers**

    **• Followers**

    **• Linked Members**

    **• Contact Persons**

    **• Sangh Contacts**

  

**ð Reports**

    **• Followers**

    **• Feed Reach**

    **• Event Attendance**

  

**ð« Support**

  

**⚙️ Settings**

  
  

ð Note 

The menu structure provided below is our **proposed navigation hierarchy** based on our current understanding of the JiNANAM platform, user roles, and expected workflows.

Our primary objective is to keep the system **simple, intuitive, and easy to use**, especially since many Temple, Jain Centre, Dharamshala, and MS Admin users may not be highly technical.

The menus have therefore been designed using a **role-based approach**, where each admin only sees the modules relevant to their responsibilities, helping reduce complexity and avoid confusion.

We welcome your recommendations and technical expertise. If you believe there is a better way to structure the navigation, improve usability, optimize performance, or simplify the workflow while maintaining all required functionality, please share your suggestions with us.

Some key principles we would like to maintain are:

  - **Role-based dynamic menus** (only show modules relevant to the logged-in admin).
  - **Minimal clicks** to complete common daily tasks.
  - **Simple and intuitive navigation** suitable for non-technical users.
  - **Scalable architecture** that can accommodate future modules without major redesign.
  - **Consistent user experience** across Web Admin Portal and Mobile Admin App (where applicable).

We are open to refining the navigation based on your experience, provided that all functional requirements defined in this PRD are preserved and no business workflows are compromised.

We encourage you to review the proposed structure and suggest improvements wherever appropriate before development begins.

  
  

# Members APP Menu  

ð  Home

  

ð° Feed

  

ð Offers

  

ð Explore

  

ð¤ Profile

  

with the **Notification Bell**, **Search**, and **Messages** in the top app bar.

  

# **ð  HOME**

## **Header**

  - Greeting
      
      - Good Morning, Saurabh
  - Profile Photo
  - Search Icon
  - Notifications Bell
  - Messages Icon

  

## **1. Daily Tithi Card**

  - Today's Tithi with description (refer sample image)
  - Panchang Details
  - Festival (if any)
  - Auspicious Information
  - Open Full Calendar

  

## **2. Quick Actions**

  - Scan QR
  - Donate
  - Book Now
  - My Bookings
  - My Digital ID
  - Emergency Help

  

## **3. Continue Journey**

Auto display ongoing activities:

  - 99 Yatra Progress (if any)
  - Varshitap Progress (If any)
  - Spiritual Counting
  - Upcoming Booking
  - Pending Donation

  

## **4. Nearby Temples & Jain Centres**

Based on GPS

Display:

  - Distance
  - Open Now
  - Community
  - Quick Directions

  

## **5. Live MS Updates**

  - Nearby MS
  - Current Location
  - Staying / Moving
  - Upcoming Chaturmas
  - Pravachan Today

  

## **6. Community Highlights**

Latest posts from:

  - Followed Temples
  - Followed MS
  - Followed Community Pages

  

## **7. Today's News**

Latest 5 News

"View All"

  

## **8. Upcoming Events**

Based on:

  - Followed Temples
  - Community
  - City

  

## **9. Offers Near You**

(Location Based)

Display:

  - Sponsor
  - Discount
  - Distance

"View All"

  

## **10. Upcoming Bookings**

Show:

  - Room Booking
  - Hall Booking
  - Pooja Booking
  - Event Booking

  

## **11. Daily Spiritual Card**

Show:

  - Today's Counter
  - Today's Goal
  - Daily Quote

  

## **12. Advertisement Banner**

Managed by Super Admin

  

## **13. Suggested Communities**

Recommended Community Pages

  

## **14. Suggested Temples**

Nearby  
Popular  
Recently Added

  

## **15. Footer Advertisement**

  
  

# **ð° FEED**

**Purpose:** Personalized Jain Community Feed as per Visibility Engine..

## **Feed Sections**

### **Community Feed**

Visibility Engine Based

Priority:

1.  Followed Temples
2.  Followed MS
3.  Followed Community Pages
4.  Same Gaccha
5.  Same Community
6.  Nearby
7.  State
8.  Country
9.  Global

  

### **Feed Types**

  - Temple Posts
  - Jain Centre Posts
  - MS Posts
  - Community Page Posts
  - Event Posts
  - Announcement Posts
  - Polls
  - Volunteer Requirements
  - Booking Updates
  - Donation Appeals
  - Chaturmas Updates
  - 99 Yatra Updates
  - Varshitap Updates

  

### **Feed Actions**

Like

Comment

Share

Bookmark

Report

Follow

  

### **Stories**

Display at top

Temple Stories

MS Stories

Community Stories

  

### **Advertisement**

Native Sponsored Feed

After every 7 posts

Managed by Super Admin

  

### **Feed Filters**

All

My Community

My City

Following

Events

Announcements

MS

Temples

  

# **ð OFFERS**

## **Featured Banner**

Large rotating banner

Managed by Super Admin

  

## **Categories**

Travel

Hotels

Restaurants

Medical

Education

Jewellery

Finance

Insurance

Real Estate

Vehicles

Shopping

Temple Services

Spiritual Products

Tours

Professionals

Healthcare

Online Services

Others

  

## **Featured Offers**

Sponsored

Premium

Trending

Exclusive

  

## **Nearby Offers**

Location Based

  

## **Categories Grid**

Easy browsing

  

## **Filters**

Near Me

My City

State

Country

Global

Newest

Highest Discount

Trending

  

## **Offer Details**

Images

Description

Discount

Validity

Terms

Contact

Directions

Website

Call

WhatsApp

Bookmark

Share

  

## **Sponsored Businesses**

Featured Listings

  

## **Coupons**

QR Coupons

Coupon Code

  

## **Advertisement**

Throughout the module

  

# **ð EXPLORE**

Think of this as the application's directory.

## **Search**

Universal Search

Search:

  - Temple
  - Jain Centre
  - MS
  - Members
  - Community Pages
  - Events
  - News
  - Tours
  - Offers
  - Bookings

  

## **Main Categories**

### **Temples**

### **Jain Centres**

### **Dharamshalas**

### **Bhojanshalas**

### **Upashrays**

### **MS**

### **Community Pages**

### **News**

### **Events**

### **Tours**

### **Donations**

### **Bookings**

### **Volunteers**

### **Pathshalas**

### **Polls**

### **Spiritual Counting**

### **99 Yatra**

### **Varshitap**

### **Tithi Calendar**

### **Nearby Services**

### **Emergency Contacts**

  

## **Discover**

Trending Temples

Popular MS

Popular Community Pages

Trending Events

Trending Offers

Most Visited Temples

Newest Temples

Nearby Places

  

## **Maps**

Nearby Temples

Nearby Dharamshalas

Nearby Bhojanshalas

Nearby Jain Centres

  

## **Advanced Filters**

Community

Sub Community

Gaccha

Country

State

City

Distance

Facilities

Availability

  

# **ð¤ PROFILE**

## **Header**

Profile Photo

Member Name

Unique Member ID

QR Code

Verified Badge

  

## **1. My Profile**

Personal Information

Family

Professional Details

Community

Preferences

Privacy

  

## **2. My Activity**

My Donations

My Bookings

My Events

My Volunteer Work

My Polls

My Reviews

My Comments

My Feed Activity

  

## **3. My Spiritual Journey**

Spiritual Counting

99 Yatra

Varshitap

Achievements

Badges

  

## **4. My Communities**

Joined Community Pages

Following Temples

Following MS

Saved Places

Favourite Offers

  

## **5. My Digital Wallet**

Donation Receipts

Booking Receipts

Digital Passes

QR Codes

  

## **6. My Notifications**

Notification History

  

## **7. My Support**

Support Tickets

Report History

Feedback

  

## **8. Settings**

Language

Currency

Notification Preferences

Privacy

Security

Password

App Theme

  

## **9. About JiNANAM**

Terms & Conditions

Privacy Policy

Help Centre

Contact Us

Version

Logout

  
  

**⭐ Final Navigation Su