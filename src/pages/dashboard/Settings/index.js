import React from 'react';

import {withRouter}from 'react-router';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';
import IconButton from '@material-ui/core/IconButton';

import EditIcon from '@material-ui/icons/Edit';
import InputAdornment from '@material-ui/core/InputAdornment';
import Divider from '@material-ui/core/Divider';

import './styles.scss';

import Selector from 'components/Selector';

import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import strings from 'strings';

import CircularProgress from '@material-ui/core/CircularProgress';
import LinearProgress from '@material-ui/core/LinearProgress';

import client from 'services/client';
import Typography from '@material-ui/core/Typography';

class Settings extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: "",
            errorField: "",
            error: false,
            name: "",
            originalName: "",
            display_name: "",
            editingName: false,
            collaborators: [],
            confirmDelete: false,
            confirmName: "",
            fetched: false,
            owner: "",
            transferConfirm: false
        }
    }

    fetchSite = () => {
        client.get('/sites/' + this.props.match.params.name).then(response => {
            const site = response.data.payload;
            site.collaborators = site.collaborators || []
            this.setState({...site, originalName: site.name, fetched: true});
        }).catch(err => {
            if(err) throw err;
        });
    }

    componentWillMount() {
        this.fetchSite();
    }

    toggleEditName = () => this.setState({
        editingName: !this.state.editingName
    });

    getCollaborators = () => {
        console.log(this.state.collaborators);
        const collaborators = this.state.collaborators.map(c => {
            // if(c.role !== "owner") {
                return {
                    label: c.email,
                    value: c.email
                }
            // }
        });
        return collaborators;
    }

    saveSettings = () => {
        client.put('/sites/' + this.props.match.params.name, {
            "display_name": this.state.display_name,
            "name": this.state.name
        }).then(response => {
            console.log(response.data);
            this.props.history.push('/site/' + this.state.name + '/settings');
            this.setState({
                error: false,
                errorMsg: "",
                errorField: ""
            });
        }).catch(err => {
            this.checkError(err);
            if(err) throw err;
        });
    }

    checkError = err => {
        const errType = err.data.message;
        switch(errType) {
            case "name_too_short": {
                this.setState({
                    errorMsg: strings.NAME_TOO_SHORT,
                    error: true,
                    errorField: "name"
                });
                break;
            }
            case "name_too_long": {
                this.setState({
                    errorMsg: strings.NAME_TOO_LONG,
                    error: true,
                    errorField: "name"
                });
                break;
            }
            case "display_name_too_long": {
                this.setState({
                    errorMsg: strings.NAME_TOO_LONG,
                    error: true,
                    errorField: "display_name"
                });
                break;
            }
            case "incorrect_characters": {
                this.setState({
                    errorMsg: strings.SITE_NAME_INCORRECT,
                    error: true,
                    errorField: "name"
                });
                break;
            }
            case "site_exists": {
                this.setState({
                    errorMsg: strings.SITE_EXISTS,
                    error: true,
                    errorField: "name"
                });
                break;
            }
            default:
                break
        }
    }

    confirmDelete = () => this.setState({
        confirmDelete: true
    });

    handleConfirmClose = () => this.setState({
        confirmDelete: false
    });

    deleteSite = () => {
        client.delete('/sites/' + this.props.match.params.name).then(response => {
            console.log(response.data);
            this.props.history.push('/');
        }).catch(err => {
            if(err) throw err;
        });
    }

    onOwnerChange = value => this.setState({
        owner: value
    });

    transferConfirm = () => this.setState({
        transferConfirm: true
    });

    closeTransferConfirm = () => this.setState({
        transferConfirm: false
    });

    transferSite = () => {
        client.post('/sites/' + this.props.match.params.name + '/transfer/' + this.state.owner.value).then(response => {
            console.log(response.data);
        }).catch(err => {
            if(err) throw err;
        });
    }

    render() {
        return (
            <div className="page dashboard-settings">
            <h1>{strings.SETTINGS}</h1>
            {!this.state.fetched && <CircularProgress/>}
            {this.state.fetched && <Grid container direction="column">
                <h2 className="primary">{strings.SITE}</h2>
                <Grid item md={12} lg={4}>
                    <TextField
                        error={this.state.errorField === "name"}
                        label={strings.NAME}
                        disabled={!this.state.editingName}
                        value={this.state.name}
                        onChange={e=>this.setState({name: e.target.value})}
                        margin="normal"
                        fullWidth
                        InputProps={{
                            endAdornment: <InputAdornment position="end">
                                <IconButton onClick={this.toggleEditName}>
                                    <EditIcon/>
                                </IconButton>
                            </InputAdornment>,
                        }}
                    />
                    <TextField
                        error={this.state.errorField === "displayName"}
                        label={strings.DISPLAY_NAME}
                        value={this.state.display_name}
                        onChange={e=>this.setState({display_name: e.target.value})}
                        margin="normal"
                        fullWidth
                    />
                    {this.state.error && <FormHelperText error={true}>
                    {this.state.errorMsg}
                </FormHelperText>}
                    <Button onClick={this.saveSettings} style={{marginTop: 15}} variant="contained" color="primary" fullWidth>{strings.SAVE}</Button>
                </Grid>
                <Divider variant="fullWidth"/>
                <Grid item md={12} lg={4}>
                    <h2 className="primary">{strings.OWNERSHIP}</h2>
                    <Selector
                        options={this.getCollaborators()}
                        value={this.state.owner}
                        backspaceRemovesValue={true}
                        placeholder={strings.OWNER}
                        onChange={this.onOwnerChange}
                    />
                    <Button onClick={this.transferConfirm} disabled={!this.state.owner} className="margin" fullWidth variant="outlined" color="primary">{strings.TRANSFER}</Button>

                </Grid>
                <Divider variant="fullWidth"/>
                <Grid item md={12} lg={4}>
                    <h2 className="primary" style={{marginBottom: 10}}>{strings.TOTAL_SIZE}</h2>
                    <Typography variant="caption">{this.state.total_size} / 500 Mo</Typography>
                    <LinearProgress variant="determinate" value={
                        (this.state.total_size * 100) / 500
                    }/>
                </Grid>
                <Divider variant="fullWidth"/>
                <Grid item md={12} lg={4}>
                    <h2 className="red-text">{strings.DANGER_ZONE}</h2>
                    <Button onClick={this.confirmDelete} fullWidth className="button-danger margin">{strings.DELETE}</Button>
                </Grid>
            </Grid>}
            <Dialog
                    open={this.state.confirmDelete}
                    onClose={this.handleConfirmClose}
                    >
                    <DialogTitle>{strings.DELETE_SITE}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {strings.CONFIRM_DELETE_SITE}             
                        </DialogContentText>
                        <TextField
                            value={this.state.confirmName}
                            onChange={e => this.setState({
                                confirmName: e.target.value
                            })}
                            autoFocus
                            margin="dense"
                            label={strings.NAME}
                            fullWidth
                        />
                        {this.state.error && this.state.errorField === "confirm" && <FormHelperText error={true}>
                            {this.state.errorMsg}
                        </FormHelperText>}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleConfirmClose} color="primary">
                            {strings.CANCEL}
                        </Button>
                        <Button disabled={this.state.originalName !== this.state.confirmName} onClick={this.deleteSite} className="button-danger">
                            {strings.DELETE}
                        </Button>
                    </DialogActions>
                </Dialog>
                <Dialog
                    open={this.state.transferConfirm}
                    onClose={this.closeTransferConfirm}
                    >
                    <DialogTitle>{strings.TRANSFER}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {strings.TRANSFER_DESCRIPTION}             
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.closeTransferConfirm} color="primary">
                            {strings.CANCEL}
                        </Button>
                        <Button onClick={this.transferSite} className="button-danger">
                            {strings.TRANSFER}
                        </Button>
                    </DialogActions>
                </Dialog>
        </div>
        );
    }
}

export default withRouter(Settings);