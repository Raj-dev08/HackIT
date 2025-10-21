import { useEffect, useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import NavbarDesktop from "./NavbarDesktop";
import NavbarMobile from "./NavbarMobile";

const NavBar = () => {
  const { authUser, checkAuth } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    checkAuth();
    setIsMounted(true);
  }, [checkAuth]);

  if (!isMounted) return null;

  return (
    <>
      {/* Desktop navbar */}
      <div className="hidden md:block">
        <NavbarDesktop authUser={authUser} />
      </div>

      {/* Mobile navbar */}
      <div className="md:hidden">
        <NavbarMobile authUser={authUser} />
      </div>
    </>
  );
};

export default NavBar;
