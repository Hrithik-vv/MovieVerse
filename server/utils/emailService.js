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

const sendOtpEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your MovieVerse OTP',
      text: `Your OTP is ${otp}. It expires in 60 seconds.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #e50914;">MovieVerse - Password Reset</h2>
          <p>You requested a password reset.</p>
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <p style="font-size: 18px;">Your OTP is: <strong>${otp}</strong></p>
            <p>This code expires in 60 seconds.</p>
          </div>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('OTP email sent to', email);
    return true;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    return false;
  }
};

module.exports = { sendBookingEmail, sendOtpEmail };

