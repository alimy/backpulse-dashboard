import React from 'react';
import Bar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import AccountCircle from '@material-ui/icons/AccountCircle';
import IconButton from '@material-ui/core/IconButton';

import Typography from '@material-ui/core/Typography';

import './styles.scss';
import {withRouter} from 'react-router';

import strings from 'strings';
import {Link} from 'react-router-dom';

import {signOut} from 'utils/token';

class AppBar extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            anchorEl: null,
            open: false
        }
    }
    
    handleMenu = event => {
        this.setState({ anchorEl: event.currentTarget, open: true });
    };

    handleClose = () => {
        this.setState({ anchorEl: null, open: false });
    };

    render() {
        return (
            <React.Fragment>
                <Bar position="fixed" className="app-bar">
                    <Toolbar>
                        {/* <IconButton
                            className="hide-desktop"
                            color="inherit"
                            aria-label="Open drawer"
                            onClick={this.handleDrawerToggle}>
                            <MenuIcon />
                        </IconButton> */}
                        <Typography style={{marginLeft: 15}} variant="h6" color="inherit" noWrap>
                            {this.props.title || "Backpulse"}
                        </Typography>
                        <div className="right">
                            <IconButton
                                aria-owns={this.state.open ? 'menu-appbar' : undefined}
                                aria-haspopup="true"
                                onClick={this.handleMenu}
                                color="inherit">
                                <AccountCircle />
                            </IconButton>
                            <Menu
                            className="menu-appbar"
                                id="menu-appbar"
                                anchorEl={this.state.anchorEl}
                                anchorOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={this.state.open}
                                onClose={this.handleClose}>
                                <Link to="/">
                                    <MenuItem onClick={this.handleClose}>{strings.MENU_MY_SITES}</MenuItem>
                                </Link>
                                <Link to="/account">
                                    <MenuItem onClick={this.handleClose}>{strings.MENU_MY_ACCOUNT}</MenuItem>
                                </Link>
                                <MenuItem onClick={signOut}>{strings.MENU_LOGOUT}</MenuItem>
                            </Menu>
                        </div>
                    </Toolbar>
                </Bar>
            </React.Fragment>
        );
    }
}

export default withRouter(AppBar);