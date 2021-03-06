import React from 'react';
import Typography from '@material-ui/core/Typography';

import './styles.scss';

import dayjs from 'dayjs';

import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import CardActions from '@material-ui/core/CardActions';
import IconButton from '@material-ui/core/IconButton';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
import Tooltip from '@material-ui/core/Tooltip';
import strings from 'strings';
import HomeIcon from '@material-ui/icons/Home';

class GalleryBox extends React.Component {
    render() {
        return (
            <Card className="gallerybox">
                <CardHeader
                    title={<Typography variant="body1">{this.props.data.title}</Typography>}
                    subheader={<Typography className="updated-at" variant="caption"> {dayjs(this.props.data.updated_at).format("DD/MM/YYYY HH:mm")}</Typography>}
                />
                <CardActions disableActionSpacing>
                    <Tooltip title={strings.EDIT}>
                        <IconButton onClick={this.props.onEdit}>
                            <EditIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={strings.DEFAULT_GALLERY}>
                        <IconButton onClick={this.props.onDefaultSet}>
                            <HomeIcon color={this.props.data.default_gallery ? "primary": "inherit"} />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title={strings.DELETE}>
                        <IconButton onClick={this.props.onDelete} style={{marginLeft: "auto"}}>
                            <DeleteIcon />
                        </IconButton>
                    </Tooltip> 
                </CardActions>
            </Card>
        );
    }
}

export default GalleryBox;