import { useRef, useContext, useState, useEffect, useMemo } from "react";
import PlagiarismOutlinedIcon from "@mui/icons-material/PlagiarismOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SystemUpdateAltOutlinedIcon from "@mui/icons-material/SystemUpdateAltOutlined";
import SpaceDashboardOutlinedIcon from "@mui/icons-material/SpaceDashboardOutlined";
import FolderSharedOutlinedIcon from "@mui/icons-material/FolderSharedOutlined";
import { Typography, Box, NativeSelect } from "@mui/material";
import { Link } from "react-router-dom";
import Novo from "@src/assets/images/Novo.png";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import MenuList from "@mui/material/MenuList";
import { UserContext } from "@src/App";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const { user } = useContext(UserContext);
  const [open, setOpen] = useState(false);
  const anchorRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Function to update scrollY state on scroll
    function handleScroll() {
      setOpen(false);
    }

    // Attach scroll event listener when component mounts
    window.addEventListener("scroll", handleScroll);

    // Detach scroll event listener when component unmounts
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []); // Empty dependency array ensures that effect runs only once on component mount

  const getRoleNameById = (roleId: string) => {
    switch (roleId) {
      case "6327fb7a-97c1-4d00-a47c-8f8df14e9168":
        return "FINANCE";
      case "711a3b76-3dfd-471c-a8a6-dee0df442399":
        return "NBRX";
      default:
        return "BUSINESS";
    }
  };
  const [userRole, setUserRole] = useState("");
  const { userRoleList } = useMemo(() => {
    const userRoleList: Array<string> = [];

    if (user.role.slice(1, -1).split(", ").length > 1) {
      user.role
        .slice(1, -1)
        .split(", ")
        .map((roleId: string) => {
          userRoleList.push(getRoleNameById(roleId));
        });
      sessionStorage.setItem("User_group", userRoleList[0]);
      setUserRole(userRoleList[0]);
    } else {
      const roleName = getRoleNameById(user.role);
      sessionStorage.setItem("User_group", roleName);
      setUserRole(roleName);
    }
    return { userRole, userRoleList };
  }, [user.role]);

  const handleRoleChange = (e: { target: { value: any } }) => {
    sessionStorage.setItem("User_group", e.target.value);
    setUserRole(e.target.value);
    navigate("/refresh");
    setTimeout(() => {
      navigate("/");
    }, 1);
  };

  const handleClose = () => {
    setOpen(!open);
  };
  let navigate = useNavigate();
  const handleIconClick = (to: string) => {
    navigate(to);
  };
  const NavItem = ({ text, to, show }: any) => {
    return show ? (
      <IconButton
        onClick={() => handleIconClick(to)}
        size="small"
        aria-haspopup="true"
        className=" bg-red-300"
        sx={{
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          className="width-full flex justify-center items-center mt-2"
        >
          {(() => {
            switch (text) {
              case "Dashboard":
                return (
                  <SpaceDashboardOutlinedIcon
                    className="text-slate-200"
                    fontSize="large"
                  />
                );
              case "Saved Preset":
                return (
                  <SystemUpdateAltOutlinedIcon
                    className="text-slate-200"
                    sx={{ fontSize: 32 }}
                  />
                );
              case "Summary":
                return (
                  <DescriptionOutlinedIcon
                    className="text-slate-200 "
                    fontSize="large"
                  />
                );
              case "Tracking":
                return (
                  <PlagiarismOutlinedIcon
                    className="text-slate-200"
                    fontSize="large"
                  />
                );
              default:
                return (
                  <FolderSharedOutlinedIcon
                    className="text-slate-200"
                    fontSize="large"
                  />
                );
            }
          })()}

          <Typography
            className="!mt-0 flex justify-center align-middle "
            color={"#ffffff"}
          >
            {text}
          </Typography>
        </Stack>
      </IconButton>
    ) : (
      <></>
    );
  };

  return (
    <Box className="sidebar h-full flex flex-col  pt-7  pb-7 align-middle bg-gradient-to-b from-blue-900 to-blue-500">
      <Link className=" flex justify-center" to="/">
        <img
          className="w-[80px]  h-12 cursor-pointer filter brightness-0 invert"
          src={Novo}
          alt="Logo"
        ></img>
      </Link>
      <IconButton
        onClick={handleClose}
        size="small"
        aria-haspopup="true"
        sx={{
          "&:hover": {
            backgroundColor: "inherit",
          },
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          className="width-full flex justify-center items-center mt-2"
        >
          <Avatar
            sx={{
              bgcolor: "#ffffff",
              color: "#000000",
              width: 50,
              height: 50,
            }}
          >
            <Typography fontSize={22} color={"#041D68"}>
              {`${user.firstName.toUpperCase().split(" ")[0][0]}${
                user.lastName.toUpperCase().split(" ")[0][0]
              }`}
            </Typography>
          </Avatar>
        </Stack>
      </IconButton>
      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        placement="bottom-start"
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "left bottom",
            }}
            className="mt-14 ml-24 border border-[#203F92] p-2"
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList
                  autoFocusItem={open}
                  id="composition-menu"
                  aria-labelledby="composition-button"
                  onKeyDown={() => {}}
                  className=" text-blue-900 grid"
                >
                  <Typography variant="h6" className="justify-self-start ">
                    <b className="text-slate-700">Name: </b>{" "}
                    {`${user.firstName.toLocaleUpperCase()} ${user.lastName.toLocaleUpperCase()}`}
                  </Typography>
                  <Typography variant="h6" className="justify-self-start">
                    <b className="text-slate-700">Email: </b> {user.email}
                  </Typography>
                  <Typography variant="h6" className="justify-self-start">
                    <b className="text-slate-700">Role: </b>
                    {user.role.slice(1, -1).split(", ").length > 1 ? (
                      <NativeSelect
                        size="medium"
                        defaultValue={userRole}
                        onChange={handleRoleChange}
                        inputProps={{
                          name: "role",
                          id: "uncontrolled-native",
                          className: "text-blue-900",
                          sx: { color: "#1e3a8a" },
                        }}
                      >
                        {userRoleList.map((role, index) => {
                          return (
                            <option
                              value={role}
                              key={index}
                              className="text-blue-900 "
                            >
                              {role}
                            </option>
                          );
                        })}
                      </NativeSelect>
                    ) : (
                      userRole
                    )}
                  </Typography>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
      {/* </Tooltip> */}

      <Typography
        className=" flex justify-center align-middle "
        color={"#ffffff"}
      >
        {user.firstName.toLocaleUpperCase()}
      </Typography>
      <NavItem
        to="/"
        text="Dashboard"
        show={
          userRole === "FINANCE" ||
          userRole === "BUSINESS" ||
          userRole === "NBRX"
        }
      />

      <NavItem
        to="/savedpreset"
        text="Saved Preset"
        show={userRole === "FINANCE"}
      />
      <NavItem
        to={userRole == "NBRX" ? "/summaryNbrx" : "/summary"}
        text="Summary"
        show={userRole === "FINANCE" || userRole === "NBRX"}
      />
      <NavItem to="/tracking" text="Tracking" show={userRole === "FINANCE"} />
      <NavItem
        to="/sharedForecasts"
        text="Shared Forecasts"
        show={
          userRole === "FINANCE" ||
          userRole === "BUSINESS" ||
          userRole === "NBRX"
        }
      />
    </Box>
  );
};

export { Sidebar };
export default Sidebar;
