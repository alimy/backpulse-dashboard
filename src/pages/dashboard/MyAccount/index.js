import React from 'react';

import AppBar from 'components/AppBar';

import strings from 'strings';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import FormHelperText from '@material-ui/core/FormHelperText';

import Snackbar from '@material-ui/core/Snackbar';
import Divider from '@material-ui/core/Divider';
import Typography from '@material-ui/core/Typography';

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import CircularProgress from '@material-ui/core/CircularProgress';

import {getUser, signOut} from 'utils/token';

import './styles.scss';
import {Elements, StripeProvider} from 'react-stripe-elements';
import client from 'services/client';
import Checkout from 'components/Checkout/index.js';
import MaskedInput from 'react-text-mask';

function ZIP(props) {
    const { inputRef, ...other } = props;
    return (
        <MaskedInput
            ref={ref => {
                inputRef(ref ? ref.inputElement : null);
            }}
            {...other}
            mask={[/\d/, /\d/, /\d/,/\d/, /\d/, /\d/, /\d/, /\d/, /\d/]}
        />
    )
}
  
class MyAccount extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            fullname: "",
            email: "",
            country: "",
            city: "",
            state: "",
            zip: "",
            address: "",

            currentPassword: "",
            newPassword: "",
            confirmPassword: "",

            error: false,
            errorMsg: "",
            errorField: "",

            confirmDelete: false,
            confirmEmail: "",
            fetched: false,
            professional: false,
            payDialog: false,
            confirmCancelSub: false
        }
    }

    fetchAccount = () => {
        client.get('/user').then(response => {
            console.log(response.data);
            const user = response.data.payload;
            this.setState({
                ...user,
                lastEmail: user.email,
                lastName: user.fullname,
                fetched: true
            });
            this.lastUser = user;
        }).catch(err => {
            if(err) throw err;
        });
    }

    componentWillMount() {
        this.fetchAccount();
    }

    updateProfile = () => {
        client.put('/profile', {
            fullname: this.state.fullname,
            email: this.state.email,
            country: this.state.country,
            address: this.state.address,
            city: this.state.city,
            state: this.state.state,
            zip: this.state.zip
        }).then(response => {
            if(this.state.lastEmail !== this.state.email) {
                this.openSnack(strings.VERIFY_EMAIL)
            };
            console.log(response.data);
        }).catch(err => {
            if(err) throw err;
        });
    }

    updatePassword = () => {
        client.put('/user/password', {
            last_password: this.state.currentPassword,
            new_password: this.state.newPassword
        }).then(response => {
            console.log(response.data);
            this.setState({
                error: false,
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });
            this.openSnack(strings.PASSWORD_CHANGED);
        }).catch(err => {
            this.checkError(err);
            if(err) throw err;
        });
    }

    handleDeleteAccount = () => {
        client.delete('/user').then(response => {
            console.log(response.data);
            signOut();
        }).catch(err => {
            this.checkError(err);
            if(err) throw err;
        });
    }

    checkError = err => {
        const errType = err.data.message;
        switch(errType) {
            case "wrong_last_password": {
                this.setState({
                    errorMsg: strings.WRONG_PASSWORD,
                    error: true,
                    errorField: "current_pass"
                });
                break;
            }
            case "password_too_short": {
                this.setState({
                    errorMsg: strings.PASSWORD_TOO_SHORT,
                    error: true,
                    errorField: "new_pass"
                });
                break;
            }
            case "password_too_long": {
                this.setState({
                    errorMsg: strings.PASSWORD_TOO_LONG,
                    error: true,
                    errorField: "new_pass"
                });
                break;
            }
            case "delete_sites_first": {
                this.setState({
                    errorMsg: strings.DELETE_ALL_APPS_FIRST,
                    error: true,
                    errorField: "confirm"
                });
                break;
            }
            default:
                break
        }
    }

    openSnack = snackText => {
        this.setState({
            snackText,
            snack: true
        });
    }

    handleClose = () => {
        this.setState({ snack: false });
    };

    openConfirm = () => this.setState({
        confirmDelete: true
    });

    handleConfirmClose = () => {
        this.setState({
            confirmDelete: false
        });
    }

    openPay = () => this.setState({
        payDialog: true
    });
    
    closePayDialog = () => this.setState({
        payDialog: false
    });
    
    onPaySuccess = () => {
        this.fetchAccount();
        this.closePayDialog();
    }

    handleChange = (type, e) => this.setState({
        [type]: e.target.value
    });
    
    confirmCancelSub = () => this.setState({
        confirmCancelSub: true
    });

    closeConfirmCancelSub = () => this.setState({
        confirmCancelSub: false
    });

    cancelSubscription = () => {
        client.delete('/account/subscription').then(response => {
            console.log(response.data);
            this.closeConfirmCancelSub();
            this.fetchAccount();
        }).catch(err => {
            if(err) throw err;
        });
    }

    render() {
        return (
            <div className="page my-account">
                <AppBar noMenu updateTheme={this.props.updateTheme}/>
                <h1>{strings.MENU_MY_ACCOUNT}</h1>
                {!this.state.fetched && <CircularProgress/>}

                <Snackbar
                    anchorOrigin={{vertical: "top", horizontal: "right"}}
                    open={this.state.snack}
                    onClose={this.handleClose}
                    autoHideDuration={2500}
                    message={<span>{this.state.snackText}</span>}
                />

                <Dialog
                    open={this.state.confirmDelete}
                    onClose={this.handleConfirmClose}
                    >
                    <DialogTitle>{strings.CLOSE_ACCOUNT}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {strings.CLOSE_ACCOUNT_DESCRIPTION}
                        </DialogContentText>
                        <TextField
                            value={this.state.confirmEmail}
                            onChange={e => this.setState({
                                confirmEmail: e.target.value
                            })}
                            autoFocus
                            margin="dense"
                            label={strings.EMAIL}
                            type="email"
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
                        <Button disabled={this.state.confirmEmail !== getUser().email} className="button-danger" onClick={this.handleDeleteAccount}>
                            {strings.DELETE}
                        </Button>
                    </DialogActions>
                </Dialog>

                {this.state.fetched && <Grid container direction="column">
                    <Grid className="group" item xs={12} md={12}>
                        <h2>{strings.PROFILE}</h2>
                        <TextField
                            error={this.state.errorField === "email"}
                            label={strings.EMAIL}
                            value={this.state.email}
                            onChange={e=>this.setState({email: e.target.value, error: false, errorField: ""})}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label={strings.NAME}
                            value={this.state.fullname}
                            onChange={e => this.handleChange('fullname', e)}
                            margin="normal"
                            fullWidth
                        />
                        <TextField
                            label={strings.COUNTRY}
                            value={this.state.country}
                            onChange={e => this.handleChange('country', e)}
                            margin="normal"
                            fullWidth
                        />
                         <TextField
                            label={strings.ADDRESS}
                            value={this.state.address}
                            onChange={e => this.handleChange('address', e)}
                            margin="normal"
                            fullWidth
                        />
                        <div className="inline-grid">
                        <Grid item md={5}>
                            <TextField
                                margin="dense"
                                label={strings.CITY}
                                onChange={e => this.handleChange('city', e)}
                                value={this.state.city}
                                fullWidth
                            />
                        </Grid>
                        <Grid item md={3}>
                            <TextField
                                margin="dense"
                                onChange={e => this.handleChange('state', e)}
                                label={strings.STATE}
                                value={this.state.state}
                                fullWidth
                            />
                        </Grid>
                            <Grid item md={3}>
                                <TextField
                                    margin="dense"
                                    onChange={e => this.handleChange('zip', e)}
                                    label={strings.POSTAL_CODE}
                                    value={this.state.zip}
                                    fullWidth
                                    InputProps={{
                                        inputComponent: ZIP
                                    }}
                                />
                            </Grid>
                        </div>
                        <Button onClick={this.updateProfile} variant="contained" color="primary">{strings.SAVE}</Button>
                    </Grid>
                    <Grid className="group" item xs={12} md={12}>
                        <h2>{strings.BILLING}</h2>
                        <div style={{marginTop: 15, display: "block"}}>
                            <Typography>{strings.PLAN_TYPE} : {this.state.professional ? strings.BACKPULSE_PRO : strings.BACKPULSE_FREE}</Typography>
                            <Button disabled={this.state.professional} onClick={this.openPay} variant="contained" color="primary">{this.state.professional ? strings.THANKYOU : strings.GO_PROFESIONNAL}</Button>
                            <br/>
                            {this.state.professional && 
                                <Button onClick={this.confirmCancelSub} className="button-danger">
                                    {strings.CANCEL_SUBSCRIPTION}
                                </Button>
                            }
                        </div>
                    </Grid>
                    <Grid className="group" item xs={12} md={12}>
                        <h2>{strings.AUTHENTICATION_PASSWORD}</h2>
                        <TextField
                            label={strings.CURRENT_PASSWORD}
                            error={this.state.errorField === "current_pass"}
                            value={this.state.currentPassword}
                            type="password"
                            onChange={e=>this.setState({currentPassword: e.target.value, error: false, errorField: ""})}
                            margin="normal"
                            fullWidth
                        />
                        <Divider className="divider"/>
                        <TextField
                            label={strings.NEW_PASSWORD}
                            error={this.state.errorField === "new_pass"}
                            value={this.state.newPassword}
                            type="password"
                            onChange={e=>this.setState({newPassword: e.target.value, error: false, errorField: ""})}
                            margin="normal"
                            fullWidth
                        />
                        <Typography>{strings.PASSWORD_RULES}</Typography>
                        <TextField
                            error={this.state.newPassword !== this.state.confirmPassword}
                            label={strings.CONFIRM}
                            type="password"
                            value={this.state.confirmPassword}
                            onChange={e=>this.setState({confirmPassword: e.target.value})}
                            margin="normal"
                            fullWidth
                        />
                        {this.state.error && this.state.errorField !== "confirm" && <FormHelperText error={true}>
                            {this.state.errorMsg}
                        </FormHelperText>}
                        <Button onClick={this.updatePassword} variant="contained" color="primary">{strings.CHANGE_PASSWORD}</Button>
                    </Grid>
                    <Grid className="group" item xs={12} md={12}>
                        <h2 className="red-text">{strings.DANGER_ZONE}</h2>
                        <Typography className="warning-text">{strings.DELETE_ALL_APPS_FIRST}</Typography>
                        <Button onClick={this.openConfirm} variant="contained" className="button-danger">{strings.CLOSE_ACCOUNT}</Button>
                    </Grid>
                </Grid>}

                <Dialog
                    open={this.state.confirmCancelSub}
                    onClose={this.closeConfirmCancelSub}
                    fullWidth
                    >
                    <DialogTitle>{strings.CANCEL_SUBSCRIPTION}</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            {strings.CANCEL_SUBSCRIPTION_DESCRIPTION}
                        </DialogContentText>
                        <DialogActions>
                            <Button onClick={this.cancelSubscription} className="button-danger">
                                {strings.CANCEL_SUBSCRIPTION}
                            </Button>
                            <Button onClick={this.closeConfirmCancelSub} variant="contained" color="primary">
                                {strings.CANCEL}
                            </Button>
                        </DialogActions>
                    </DialogContent>
                </Dialog>

                <Dialog
                    open={this.state.payDialog}
                    onClose={this.closePayDialog}
                    fullWidth
                    >
                    <DialogTitle>{strings.GO_PROFESIONNAL}</DialogTitle>
                    <DialogContent>
                        <DialogContentText variant="h3" color="primary" style={{marginBottom: 15}} className="primary-text">
                            {strings.PRO_PRICE}
                        </DialogContentText>
                        <StripeProvider apiKey="pk_test_BFTN9aWHTKMGTvYPSShPqHna">
                            <Elements>
                                <Checkout onSuccess={this.onPaySuccess} close={this.closePayDialog} lastUser={this.lastUser} />
                            </Elements>
                        </StripeProvider>
                    </DialogContent>
                </Dialog>
            </div>
        )
    }
}

export default MyAccount;