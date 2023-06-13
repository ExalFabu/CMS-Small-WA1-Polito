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
import Page from "./routes/Page";
import ErrorHandler from "./components/ErrorHandler";

function App() {
  const [user, setUser] = useState(null);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route
          path="/"
          element={<Header user={user} logout={() => setUser(null)} />}
        >
          <Route errorElement={<ErrorHandler />}>
            <Route exact path="" loader={pages.getPages} element={<Home user={user} />} />
            <Route exact path="login" element={<LoginForm login={setUser} />} />
            <Route path="page/:id" loader={({ params }) => pages.getPage(params.id)} element={<Page user={user} />} />
            <Route shouldRevalidate={() => false} exact path="page/new" loader={() => ({ title: "Nuova Pagina", author: user.id, blocks: [], author_name: user.name, published_at: null })} element={<Page user={user} isNew={true} />} />
          </Route>
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
