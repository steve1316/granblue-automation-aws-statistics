import React, { useState, useEffect } from "react"
import makeStyles from "@mui/styles/makeStyles"
import { AppBar, Toolbar, Typography, Button, IconButton, Drawer, List, ListItem, ListItemText, Divider, ListItemIcon, Box, Theme } from "@mui/material"
import MenuIcon from "@mui/icons-material/Menu"
import { Link as RouterLink, useHistory } from "react-router-dom"
import { AssignmentInd, Home, Logout, InsertChart } from "@mui/icons-material"

const NavBar = () => {
    const useStyles = makeStyles((theme: Theme) => ({
        emptyDivider: {
            flexGrow: 1,
        },
        menuButton: {
            marginRight: theme.spacing(2),
            transition: "0.3s all ease",
            "&:hover": {
                color: "#01bf71",
            },
        },
        title: {
            cursor: "pointer",
            fontSize: "1.5rem",
            marginLeft: "24px",
            fontWeight: "bold",
            textDecoration: "none",
            color: "#fff",
            transition: "0.3s all ease",
            "&:hover": {
                color: "#01bf71",
            },
        },
        body: {
            transition: "0.5s all ease",
        },
        loginButton: {
            color: "#fff",
            fontSize: "16px",
            transition: "0.3s all ease",
            "&:hover": {
                color: "#01bf71",
            },
        },
        link: {
            color: "#000",
            textDecoration: "none",
            "&:hover": {
                color: "#01bf71",
            },
        },
        drawerBody: {
            height: "100%",
            width: "250px",
        },
        drawerIcon: {},
    }))

    const classes = useStyles()
    const history = useHistory()

    const [scrollNav, setScrollNav] = useState(false)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    // Add listener for when the user scrolls the page.
    useEffect(() => {
        window.addEventListener("scroll", toggleScroll)
    }, [])

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen)
    }

    // If user's y-position is greater than the specified offset, allow the page to send the user back to the top of the page.
    const toggleScroll = () => {
        if (window.pageYOffset > 100) {
            setScrollNav(true)
        } else {
            setScrollNav(false)
        }
    }

    // Send the user back to the top of the page.
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        })
    }

    return (
        <AppBar className={classes.body} id="header" style={{ background: scrollNav ? "#101522" : "transparent", boxShadow: scrollNav ? "5px" : "none" }}>
            <Toolbar>
                <IconButton edge="start" className={classes.menuButton} color="inherit" aria-label="menu" onClick={toggleDrawer} size="large">
                    <MenuIcon />
                </IconButton>

                <Drawer anchor="left" open={isDrawerOpen} onClose={toggleDrawer}>
                    <Box className={classes.drawerBody}>
                        <List>
                            <RouterLink to="/" className={classes.link}>
                                <ListItem button key="home">
                                    <ListItemIcon className={classes.drawerIcon}>
                                        <Home />
                                    </ListItemIcon>
                                    <ListItemText primary="Home" />
                                </ListItem>
                            </RouterLink>

                            <RouterLink to="/gateway" className={classes.link}>
                                <ListItem button key="getstarted">
                                    <ListItemIcon className={classes.drawerIcon}>
                                        <AssignmentInd />
                                    </ListItemIcon>
                                    <ListItemText primary="Get Started" />
                                </ListItem>
                            </RouterLink>

                            <RouterLink to="/dashboard" className={classes.link}>
                                <ListItem button key="dashboard">
                                    <ListItemIcon className={classes.drawerIcon}>
                                        <InsertChart />
                                    </ListItemIcon>
                                    <ListItemText primary="Dashboard" />
                                </ListItem>
                            </RouterLink>
                        </List>
                    </Box>
                </Drawer>

                <Typography
                    variant="h6"
                    className={classes.title}
                    onClick={() => {
                        history.push("/")
                        scrollToTop()
                    }}
                >
                    GA Statistics
                </Typography>

                <div className={classes.emptyDivider} />

                <Button
                    color="inherit"
                    className={classes.loginButton}
                    onClick={() => {
                        history.push("/gateway")
                    }}
                >
                    Log In
                </Button>
            </Toolbar>
        </AppBar>
    )
}

export default NavBar
