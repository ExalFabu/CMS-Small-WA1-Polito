import "bootstrap/dist/css/bootstrap.min.css";
import { createContext, useEffect, useState } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  json,
  Route,
  RouterProvider,
} from "react-router-dom";
import Header from "./components/header/Header";
import Home from "./routes/Home";
import LoginForm from "./routes/LogIn";
import auth from "./api/auth";
import pages from "./api/pages";
import Page from "./routes/Page";
import ErrorHandler from "./components/ErrorHandler";
import NotFound from "./routes/404";

const CHECK_AUTH_INTERVAL = 1000 * 30;// 60 * 5; // 5 minutes

const newPageLoader = (user) => {
  if (!user || user.role === 'user') throw json({ error: "Cannot create a new Page", details: "You must be logged in" }, 401);
  return { title: "Empty Page", author: user.id, blocks: [], author_name: user.name, published_at: null }
};

export const userContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (user) {
        auth.checkAuth().then((response) => {
          if (response?.id !== user.id) setUser(null)
        }).catch(() => {
          setUser(null) // Useful when backend restarts and session is lost.
        });
      }
    }, CHECK_AUTH_INTERVAL);
    return () => clearInterval(interval);
  }, [user]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={<Header user={user} logout={() => setUser(null)} />}
        >
          <Route errorElement={<ErrorHandler />}>
            <Route exact path="" loader={pages.getPages} element={<Home/>} />
            <Route exact path="login" element={<LoginForm login={setUser} />} />
            <Route path="page/:id" loader={({ params }) => pages.getPage(params.id)} element={<Page />} />
            <Route shouldRevalidate={() => false} exact path="page/new" loader={() => newPageLoader(user)} element={<Page isNew={true} />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </>
    )
  );

  useEffect(() => {
    if (!user) {
      auth.checkAuth().then((user) => setUser(user));
    }
  });


  return <userContext.Provider value={user}>
    <RouterProvider router={router} />
  </userContext.Provider>;
}

export default App;
