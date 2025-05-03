# Brodie's Pizza Project 

## Features (I think I got everything I planned on)

### Customer Features
- User authentication (register, login, password reset)
- Browse pizza menu with filters and categories
- Add items to cart and customize orders
- Checkout process with payment options (payment info is not saved)
- Order tracking and history
- User profile management

### Employee Features
- Order management dashboard
- Update order status (preparing, ready, delivered)
- View customer information
- Daily order reports

### Admin Features
- Menu management (add, edit, delete items)
- User management (customers and employees)
- Sales analytics and reporting
- System configuration

## Tech Stack

- **Frontend**: EJS templates, HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Database**: MySQL/SQLite
- **Authentication**: Express-session, bcrypt
- **Email**: Nodemailer
- **File Upload**: Multer
- **Other Tools**: Moment.js for date handling

## Testing

- Over 50 automated Mocha tests for every minor feature I could think of

## Project Structure

- **`/config`**: Configuration files for the application
- **`/data`**: Initial data and seeds for the database
- **`/middleware`**: Custom middleware functions
- **`/models`**: Database models
- **`/public`**: Static assets (CSS, JavaScript, images)
- **`/routes`**: Application routes
- **`/views`**: EJS templates
- **`app.js`**: Main application file
