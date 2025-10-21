import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Plus, Search, Users, User, LogOut, LogIn, Settings, Bell , MessageCircle} from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useHackStore } from "../store/useHackStore";

const NavbarDesktop = ({ authUser }) => {
  const location = useLocation();
  const { logout } = useAuthStore();
  const { changeSearchFilter } = useHackStore();
  const [text, setText] = useState("");
  const notifications = localStorage.getItem('notifications')
  const notificationsLength = notifications ? notifications.split(",").length / 2  : null

  const handleFormChange = (e) => {
    e.preventDefault();
    changeSearchFilter(text);
  };

  const navItem = (path, label, Icon) => (
    <Link
      to={path}
      className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold font-mono hover:bg-primary hover:text-primary-content ${
        location.pathname === path ? "bg-primary text-primary-content" : ""
      }`}
    >
      <Icon size={18} /> <p className="2xl:block hidden">{label}</p>
      { path === "/notifications" && <sup className="text-xs">{notificationsLength}</sup>}
    </Link>
  );

  return (
    <header className="bg-base-100 fixed top-0 left-0 w-full z-50 shadow-md h-14">
      <div className="container mx-auto flex justify-between items-center py-3 px-5">
        <Link to="/" className="text-2xl font-bold hover:text-primary">
          HackIt
        </Link>
        {location.pathname === "/" && (
          <form
            onSubmit={handleFormChange}
            className="flex items-center bg-base-200 rounded-md px-3 py-1 w-[400px] mx-4"
          >
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent outline-none"
            />
            <button type="submit">
              <Search className="text-primary" />
            </button>
          </form>
        )}
        <nav className="flex items-center gap-6">
          {authUser ? (
            <>
              {navItem("/", "Explore", Search)}
              {navItem("/friends", "Friends", Users)}
              {navItem("/messages", "Messages", MessageCircle)}
              {navItem("/profile", "Profile", User)}
              {navItem("/create", "Create", Plus)}
              {navItem("/notifications","Notifications",Bell)}
              
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 rounded-md font-semibold font-mono hover:bg-error hover:text-error-content"
              >
                <LogOut size={18} /> 
              </button>
            </>
          ) : (
            navItem("/login", "Login", LogIn)
          )}
          {navItem("/settings", "Settings", Settings)}
        </nav>
      </div>
    </header>
  );
};

export default NavbarDesktop;
