import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import UpdateCustomer from "./pages/UpdateCustomer.js";
import Dashborad from "./pages/dashboard.js";
import Homepage from "./pages/Homepage.js";
import Login from "./pages/CustomerLogin.js";
import AddRoom from './pages/AddRoom.js';
import RoomList from './pages/DisplayRoom.js';
import Bookroom from './pages/Bookroom.js';
import Register from "./pages/CustomerRegister.js";
import Profilepage from './pages/Profile.js';
import BookingForm from './pages/BookingForm.js'
import RoomDetailsPage from './pages/Rating.js';
import Mylistings from './pages/MyListings.js';

import Confirm from './pages/Confirm.js';
import AdminLogin from './pages/AdminLogin.js';
import AdminRegister from './pages/AdminRegister.js';
import Admindashboard from './pages/Admindashboard.js';
import Properties from './pages/Propertieshomepage.js';
import AboutUs from './pages/About.js';
import HAboutUs from './pages/HomeAboutus.js';
import Terms from './pages/TermsCondi.js';

import RegisterServiceProvider from "./pages/RegisterServiceProvider.js";
import ServiceAgentDashboard from './pages/ServiceAgentDash.js';
import ViewServiceProviders from './pages/ViewServiceProviders.js';
import ViewVerifyList from './pages/ViewVerifyList.js';
import CustomerServiceProviders from './pages/CustomerServiceProviders.js';
import Ticket from './pages/Ticket.js';

import Message from './pages/Chat.js';
import ServiceProviderDetails from './pages/ServiceProviderDetails.js';
import SavedProviders from './pages/SavedProviders.js';

import CustomerCareLogin from'./pages/CustomerCareLogin.js';
import CustomerCareRegister from './pages/CustomerCareRegister.js';
import CustomerCareDashboard from './pages/CustomerCareDashboard.js';




function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Homepage />} />     
          <Route path="/dash" element={<Dashborad />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/update-customer/:id" element={<UpdateCustomer />} /> 

          <Route path="/Properties" element={<Properties />} />          

            

          <Route path="/Profile" element={<Profilepage />} /> 
          <Route path='/AddRoom' element={<AddRoom />} />
          <Route path='/RoomList' element={<RoomList />} />
          <Route path='/Bookroom' element={<Bookroom />} />
          <Route path='/Bookroomform' element={<BookingForm/>} />
          <Route path='/MyRoom' element={<RoomDetailsPage/>} />
          <Route path='/MyListings' element={<Mylistings/>} />
          
          <Route path='/Confirm' element={<Confirm/>} />
          <Route path="/StaffLogin" element={<AdminLogin />} />
          <Route path="/AdminRegister" element={<AdminRegister />} />
          <Route path="/Admindash" element={<Admindashboard />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/HAboutUs" element={<HAboutUs />} />
          <Route path="/Terms" element={<Terms />} />

          <Route path="/register-service-provider" element={<RegisterServiceProvider />} />
          <Route path="/service-agent-dash" element={<ServiceAgentDashboard />} />
          <Route path="/service-provider-list" element={<ViewServiceProviders />} />
          <Route path="/service-provider-verify" element={<ViewVerifyList />} />
          <Route path="/Ticket" element={<Ticket />} />
          <Route path="/chatpage" element={<Message />} />
          <Route path="/service-providers" element={<CustomerServiceProviders />} />
          <Route path="/service-providers-details" element={<ServiceProviderDetails />} />
          <Route path="/saved-providers" element={<SavedProviders />} />

          <Route path="/CustomerCareLogin" element={<CustomerCareLogin />} />
          <Route path="/CustomerCareRegister" element={<CustomerCareRegister />} />
          <Route path="/CustomerCareDashboard" element={<CustomerCareDashboard />} />

        </Routes>
      </div>
    </Router>
  );
}

export default App;
