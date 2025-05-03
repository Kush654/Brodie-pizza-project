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
- **Database**: MySQL/SQLite (configurable, always uses SQLite but has the option for MySQL in the name of scalability)
- **Authentication**: Express-session, bcrypt
- **Email**: Nodemailer
- **File Upload**: Multer
- **Other Tools**: Moment.js for date handling

## Testing

Core functionality testing added via Mocha for:
- User registration and login
- Cart management
- Checkout process
- Employee operations
- Admin features

## Project Structure

- **`/config`**: Configuration files including database setup
- **`/data`**: Initial data and seeds for the database
- **`/middleware`**: Custom middleware functions (authentication, etc.)
- **`/models`**: Database models (User, Order, MenuItem, etc.)
- **`/public`**: Static assets (CSS, JavaScript, images)
- **`/routes`**: Application routes for different features
- **`/views`**: EJS templates for rendering pages
- **`app.js`**: Main application entry point
- **`TestDocumentation.md`**: Documentation of test cases

## Deployment Notes

For production deployment:
1. Set NODE_ENV=production in environment
2. Use a process manager like PM2
3. Ensure secure SESSION_SECRET value
4. Configure proper database credentials if you are using MySQL for some reason 
5. Set up HTTPS with a valid SSL certificate
