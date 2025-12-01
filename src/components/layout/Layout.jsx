import { useAuth } from "../../context/AuthContext";
import AdminLayout from "./AdminLayout";
import PublicLayout from "./PublicLayout";
//import RojgarAndNirmanLayout from "./RojgarAndNirmanLayout";

export default function Layout () {
  const { isAuthenticated, userRole } = useAuth();

  // if(isAuthenticated && window.location.pathname.startsWith('/rojgarAndNirman')){
  //   return <RojgarAndNirmanLayout/>
  // }

  if (isAuthenticated && userRole === 'PORTAL_ADMIN' || userRole === 'EDITOR' || userRole === 'PUBLISHER') {
    
    return <AdminLayout />;
  }

  return <PublicLayout/>;
};
