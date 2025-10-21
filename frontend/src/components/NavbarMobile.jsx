import { Link, useLocation } from "react-router-dom";
import { Search, Users, User, Plus, LogOut, LogIn, Settings, MessageSquare, Bell } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
const NavbarMobile = ({ authUser }) => {
  const { logout } = useAuthStore();
  const location = useLocation();
  const notifications = localStorage.getItem('notifications')
  const notificationsLength = notifications ? notifications.split(",").length / 2  : null
  

  const navButton = (path, Icon, label, onClick) => (
    <div
      onClick={onClick}
      className={`flex relative flex-col items-center justify-center w-full p-2 ${
        location.pathname === path ? "text-primary" : "text-base-content"
      }`}
    >
      <Icon size={20} />
      <span className="text-xs sm:block hidden">{label}</span>
      { path === "/notifications" && <sup className="text-xs font-semibold absolute top-0 right-0">{notificationsLength }</sup>}
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 w-full bg-base-100 border-t border-base-300 flex justify-between z-50 gap-1 p-3">
      {authUser ? (
        <>
          <Link to="/">{navButton("/", Search, "Explore")}</Link>
          <Link to="/friends">{navButton("/friends", Users, "Friends")}</Link>
          <Link to="/messages">{navButton("/messages", MessageSquare, "Chat")}</Link>
          <Link to="/create">{navButton("/create", Plus, "Create")}</Link>
          <Link to="/profile">{navButton("/profile", User, "Profile")}</Link>
          <Link to="/notifications">{navButton("/notifications", Bell, "Notifications")}</Link>
          <button onClick={logout}>{navButton("/logout", LogOut, "Logout")}</button>
        </>
      ) : (
        <Link to="/login">{navButton("/login", LogIn, "Login")}</Link>
      )}
      <Link to="/settings">{navButton("/settings", Settings, "Settings")}</Link>
    </div>
  );
};

export default NavbarMobile;
