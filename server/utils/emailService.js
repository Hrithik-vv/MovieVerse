const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendBookingEmail = async (booking) => {
  try {
    const movie = booking.movieId;
    const theatre = booking.theatreId;
    const user = booking.userId;

    const seatsStr = booking.seats.map(([row, col]) => `Row ${row + 1}, Seat ${col + 1}`).join(', ');

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'Your MovieVerse Ticket Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e50914;">MovieVerse - Booking Confirmation</h2>
          <p>Dear ${user.name},</p>
          <p>Your ticket booking has been confirmed!</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3>Booking Details:</h3>
            <p><strong>Movie:</strong> ${movie.title}</p>
            <p><strong>Theatre:</strong> ${theatre.name}</p>
            <p><strong>Location:</strong> ${theatre.location}</p>
            <p><strong>Showtime:</strong> ${new Date(booking.showtime).toLocaleString()}</p>
            <p><strong>Seats:</strong> ${seatsStr}</p>
            <p><strong>Total Amount:</strong> ₹${booking.totalPrice}</p>
            <p><strong>Booking ID:</strong> ${booking._id}</p>
          </div>
          <p>Thank you for choosing MovieVerse!</p>
          <p>Enjoy your movie!</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Booking confirmation email sent');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendBookingEmail;

