import "bootstrap/dist/css/bootstrap.min.css";
import React, { useEffect, useState } from "react";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Header from "./components/Header";
import Home from "./routes/Home";
import LoginForm from "./routes/LogIn";
import auth from "./api/auth";
import pages from "./api/pages";
import metaApi from "./api/meta"
import Page from "./routes/Page";

function App() {
  const [user, setUser] = useState(null);
  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={<Header user={user} logout={() => setUser(null)} />}
        >
          <Route exact path="" loader={pages.getPages} element={<Home user={user} />} />
          <Route exact path="login" element={<LoginForm login={setUser} />} />
          <Route path="page/:id" loader={({params}) => pages.getPage(params.id)} element={<Page user={user} />} />
        </Route>
      </>
    )
  );

  useEffect(() => {
    if (!user) {
      auth.checkAuth().then((user) => setUser(user));
    }
  }, []);

  return <RouterProvider router={router} />;
}

export default App;
