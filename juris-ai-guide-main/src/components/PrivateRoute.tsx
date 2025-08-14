import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

interface store {
    isLogin: boolean;
}

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const isLogin = useSelector((state: store) => state.isLogin);

  return isLogin ? children : <Navigate to="/signIn" replace />;
};

export default PrivateRoute;