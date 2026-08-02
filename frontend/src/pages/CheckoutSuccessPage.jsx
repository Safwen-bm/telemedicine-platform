import { Link } from "react-router-dom";

const CheckoutSuccessPage = () => {
    return (
        <div className="bg-gray-100 h-screen flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg md:mx-auto max-w-md w-full">
                <svg
                    viewBox="0 0 24 24"
                    className="text-green-600 w-16 h-16 mx-auto my-6"
                >
                    <path
                        fill="currentColor"
                        d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24zm-2 17l-5-5 1.4-1.4L10 14.2l7.6-7.6L19 8l-9 9z"
                    />
                </svg>
                <div className="text-center">
                    <h3 className="md:text-2xl text-base text-gray-900 font-semibold text-center">
                        Payment Done
                    </h3>
                    <p className="text-gray-600 my-2">
                        Thank you for your payment! Your appointment has been successfully booked.
                    </p>
                    <p className="text-gray-600">Have a nice day!</p>
                    <div className="py-10 text-center">
                        <Link
                            to="/home"
                            className="px-12 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition duration-300"
                        >
                            Go Back To Home
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutSuccessPage;