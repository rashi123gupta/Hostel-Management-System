## PROJECT TITLE:
Hostel Management System


## DESCRIPTION:
This project is an advanced, serverless Hostel Management System built with React and Firebase, designed to streamline hostel and mess operations.

It extends a core system (student registration, leave management, complaint handling) by introducing two major new modules:
- Mess Management: A complete module to manage weekly mess schedules, gather student feedback, and handle menu suggestions.
- Real-time Notifications: A feature that uses Firebase Cloud Messaging to instantly alert users about important updates, such as leave approvals, complaint resolutions, and changes to the mess menu.

This cloud-native solution provides a single, responsive, and scalable platform for modern hostel administration.



## KEY FEATURES:
This system is built with a role-based access control model, providing distinct functionalities for three key user types: Student, Warden, and Superuser.

- Student: 
* View and edit their personal profile.
* Apply for leave and track its approval status in real-time.
* Raise complaints or maintenance requests and track their resolution.
* View the weekly mess menu.
* Submit feedback on the mess.
* Propose new suggestions for the mess menu.

- Warden (Administrator):
* View and edit their own profile.
* Create new students.
* Manage student leave requests (approve or reject).
* Review and resolve student complaints.
* Manage the mess:
    * Update the weekly mess menu.
    * Review the student menu suggestions.

- Superuser (System Administrator):
* View and edit their own profile.
* View a comprehensive list of all users (students and wardens).
* Manage user roles:
    * Create new  user(warden).
    * Manage user account status.



## QUALITY ATTRIBUTE:
1. SCALABILITY (ISO: Adaptability):
* Justification: A hostel management system must function effectively as the institution expands, handling high-traffic periods (like the start of a new semester) just as well as off-peak times. The system must be able to grow from 50 to 5,000+ students without performance issues or manual intervention.

* Implementation: We delegate infrastructure management to Google's managed services, which are designed to scale globally by default.
- Firebase Hosting (BaaS): Hosts the static React Single-Page Application (SPA) and serves it as a global Content Delivery Network (CDN). 
- Cloud Firestore (BaaS): A distributed NoSQL database that scales horizontally. 
- Cloud Functions (FaaS): Firebase automatically scales by launching new server instances to process each request concurrently. It can instantly handle a sudden spike and then scale back down to zero.

2. SECURITY (ISO: Security):
* Justification: The system handles private and sensitive student data, including personal information, complaints, and leave requests. A strong, multi-layered security model is essential to guarantee data integrity (only privileged users can write) and confidentiality (only authorized users can read).

* Implementation: We implemented a three-tiered Role-Based Access Control (RBAC) system (superuser, warden, student) that is enforced at every layer of the application.

3. MODULARITY (ISO: Maintainability):
* Justification: A modern application must be expandable and maintainable. We designed the system to be highly modular by arranging code into separate, interchangeable parts.

* Implementation: The folder structure adheres to a rigorous Separation of Concerns (SoC).
- src/app/: Contains only the "View" components (the pages). These are responsible for displaying data but lack any direct database logic.
- src/components/: Holds all reusable user interface elements (e.g., Navbar, AddUserModal, Cards, Buttons) that are shared across numerous pages.
- src/services/: All database communication logic is contained here. Modules like leaveService.js, userService.js, and messMenuService.js hold all the Firebase queries, abstracting this logic away from the view components.
- functions/: All backend Node.js code for our Cloud Functions is contained in this folder, which is an entirely separate project, ensuring a clean separation between frontend and backend code.



## TECHNOLOGY USED:
This project is built on a modern, serverless architecture.

- Frontend:
* React.js
* React Context API

- Backend:
* Google Firebase
* Firebase Authentication
* Firebase Firestore
* Firebase Cloud Messaging (FCM)
* Firestore Security Rules

- Hosting:
* Firebase Hosting



## GETTING STARTED:
Follow these steps to get a local copy up and running.

* Prerequisites:
- Node.js installed on your machine
- `npm` or `yarn` package manager

* Installation:

1. Clone the repo:
   git clone https://github.com//rashi123gupta/Hostel-Management-System
 
2. Install NPM packages:
   npm install

3. Verify Firebase Configuration: The necessary Firebase configuration is already included in this project. You do not need to create 
your own account or set up any API keys.

4. Start the development server:
   npm start


## DEMONSTRATION CREDENTIALS:
For demonstration and testing purposes, you can use the following pre-configured accounts. These accounts have been created in the Firebase Authentication system to allow for immediate access to both user roles.

- Superuser Account:
    Email               Password
superuser@gmail.com     su@hms

- Warden Account:
    Email               Password
warden1@abc.com         warden1

- Student Account:
    Email               Password
student1@abc.com        student1



## LIVE DEMO:
You can view a live demo of the project here: https://hostel-management-system-fde00.web.app/


## MADE BY:
Shrusti Jain
M25CSE030
MTech CSE

Rashi Gupta
M25CSE025
MTech CSE
