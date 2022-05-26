import * as React from "react";
import { Grid, GridColumn } from "@progress/kendo-react-grid";
import { orderBy } from "@progress/kendo-data-query";
import { ExcelExport } from "@progress/kendo-react-excel-export";
import "./styles.css";
import { useState } from "react";

const movieUrl =
  "https://api.themoviedb.org/3/movie/popular?api_key=50a3783638e0c3361b338776e481a10c";

const App = () => {
  const [users, setUsers] = React.useState([]);
  const [sort, setSort] = React.useState([
    {
      field: "email",
      dir: "asc"
    }
  ]);
  const [remoteSort, setRemoteSort] = React.useState([
    {
      field: "email",
      dir: "asc"
    }
  ]);

  const [remoteMovieSort, setRemoteMovieSort] = React.useState([
    {
      field: "vote_count",
      dir: "asc"
    }
  ]);

  const [movies, setMovies] = React.useState([]);

  const [remoteUsers, setRemoteUsers] = React.useState([]);
  const [initUsers, setInitUsers] = React.useState([]);
  const [page, setPage] = React.useState({
    skip: 0,
    take: 10
  });
  const [remotePage, setRemotePage] = React.useState({
    skip: 0,
    take: 5,
    total: 0
  });

  const [remoteMoviePage, setRemoteMoviePage] = React.useState({
    skip: 0,
    take: 10,
    total: 0
  });
  const [filterValue, setFilterValue] = useState(null);

  async function fetchUsersJSON() {
    const response = await fetch("https://reqres.in/api/users?per_page=600");
    const res = await response.json();
    setUsers(res.data);
    setInitUsers(res.data);
  }
  async function fetchMoviesJson(page, language = "en-US") {
    const response = await fetch(
      `${movieUrl}&language=${language}&page=${page}`
    );
    const res = await response.json();
    console.log(res.results);
    setMovies(res.results);
    // setRemoteUsers(res.results);
    // setRemotePage({ ...remotePage, total: res.total });
  }

  async function fetchRemoteUsersJSON(page, sortField, sortDir) {
    const response = await fetch(
      `https://reqres.in/api/users?per_page=5&page=${page}`
    );
    const res = await response.json();
    setRemoteUsers(res.data);
    setRemotePage({ ...remotePage, total: res.total });
  }
  async function fetchAllUsersJSON() {
    const response = await fetch("https://reqres.in/api/users?per_page=600");
    const res = await response.json();
    return await res.data;
  }

  const changeLocalFilterInput = (event) => {
    setUsers(
      initUsers.filter((user) =>
        user.email.toUpperCase().includes(event.target.value.toUpperCase())
      )
    );
  };
  const changeRemoteFilterInput = (event) => {
    setFilterValue(event.target.value);
    setRemoteUsers(
      initUsers.filter((user) =>
        user.email.toUpperCase().includes(event.target.value.toUpperCase())
      )
    );
  };
  const pageChange = (event) => {
    setPage(event.page);
  };
  const remotePageChange = (event) => {
    setRemotePage(event.page);
    fetchRemoteUsersJSON(
      event.page.skip / 5 + 1,
      remoteSort.field,
      remoteSort.dir
    );
  };
  const remoteSortChange = (mysort) => {
    setRemoteSort(mysort);
    fetchRemoteUsersJSON(remotePage.skip / 5 + 1, mysort.field, mysort.dir);
  };

  const remoteMoviesPageChange = (event) => {
    console.log("movie change",event)
    setRemoteMoviePage(event.page);
    fetchMoviesJson(event.page.skip / 5 + 1);
  };

  React.useEffect(() => {
    fetchUsersJSON();
    fetchRemoteUsersJSON(1, remoteSort.field, remoteSort.dir);
    fetchMoviesJson(1);
  }, []);

  const _export = React.useRef(null);
  const _exportLocal = React.useRef(null);
  const filterInput = React.useRef(null);

  const excelExportRemote = () => {
    if (_export.current !== null) {
      if (filterValue === null) {
        const allUsers = fetchAllUsersJSON();
        console.log(allUsers);

        _export.current.save(allUsers);
      } else {
        _export.current.save();
      }
    }
  };

  const excelExportLocal = () => {
    if (_exportLocal.current !== null) {
      _exportLocal.current.save();
    }
  };

  return (
    <React.Fragment>
      <h1>Local</h1>
      <label>External Filter: </label>
      <input onChange={changeLocalFilterInput} />

      <ExcelExport data={users} ref={_exportLocal}>
        <Grid
          style={{
            maxHeight: "400px"
          }}
          data={orderBy(users.slice(page.skip, page.take + page.skip), sort)}
          skip={page.skip}
          take={page.take}
          total={users.length}
          // pageable={true}
          pageable={{
            pageSize: 4,
            info: false,
            previousNext: true
          }}
          onPageChange={pageChange}
          sortable={true}
          sort={sort}
          onSortChange={(e) => {
            setSort(e.sort);
          }}
        >
          <GridColumn field="email" title="Email" width="300px" />
          <GridColumn field="first_name" title="First Name" width="150px" />
          <GridColumn field="last_name" title="Last Name" width="150px" />
        </Grid>
        <button
          title="Export Excel"
          className="bnt-download"
          onClick={excelExportLocal}
        >
          Download
        </button>
      </ExcelExport>
      <h1>Remote</h1>
      <label>External Filter: </label>
      <input ref={filterInput} onChange={changeRemoteFilterInput} />
      <ExcelExport data={remoteUsers} ref={_export}>
        <Grid
          style={{
            maxHeight: "400px"
          }}
          data={remoteUsers}
          skip={remotePage.skip}
          take={remotePage.take}
          total={remotePage.total}
          // pageable={true}
          pageable={{
            pageSize: 4,
            info: false,
            previousNext: true
          }}
          sortable={true}
          sort={remoteSort}
          onSortChange={(e) => {
            remoteSortChange(e.sort);
          }}
          onPageChange={remotePageChange}
        >
          <GridColumn field="email" title="Email" width="300px" />
          <GridColumn field="first_name" title="First Name" width="150px" />
          <GridColumn field="last_name" title="Last Name" width="150px" />
        </Grid>
        <button
          title="Export Excel"
          className="bnt-download"
          onClick={excelExportRemote}
        >
          Download
        </button>
      </ExcelExport>
      <h1>Remote Movies</h1>
      <label>External Filter: </label>
      <input ref={filterInput} onChange={changeRemoteFilterInput} />
      <ExcelExport data={movies} ref={_export}>
        <Grid
          style={{
            maxHeight: "400px"
          }}
          data={movies}
          skip={remoteMoviePage.skip}
          take={remoteMoviePage.take}
          total={remoteMoviePage.total}
          // pageable={true}
          pageable={{
            pageSize: 4,
            info: false,
            previousNext: true
          }}
          remoteMovieSort
          sortable={true}
          sort={remoteMovieSort}
          onSortChange={(e) => {
            remoteSortChange(e.sort);
          }}
          onPageChange={remoteMoviesPageChange}
        >
          <GridColumn field="id" title="Id" width="300px" />
          <GridColumn field="title" title="Movie Name" width="150px" />
          <GridColumn field="release_date" title="Release date" width="150px" />
          <GridColumn field="vote_count" title="Vote Count" width="150px" />
        </Grid>
        <button
          title="Export Excel"
          className="bnt-download"
          onClick={excelExportRemote}
        >
          Download
        </button>
      </ExcelExport>
    </React.Fragment>
  );
};
export default App;
