import React from 'react';
import './App.css';
import Amplify, { API, graphqlOperation, Storage } from 'aws-amplify';
import awsconfig from './aws-exports';
import { AmplifySignOut, withAuthenticator } from '@aws-amplify/ui-react';
import { listFiles } from "./graphql/queries"
import { updateFile , createFile} from './graphql/mutations';

import { Paper, IconButton, TextField } from '@material-ui/core';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import FavoriteIcon from '@material-ui/icons/Favorite';
import PauseIcon from '@material-ui/icons/Pause';
import AddIcon from '@material-ui/icons/Add';
import PublishIcon from '@material-ui/icons/Publish';

import ReactPlayer from 'react-player';

import { v4 as uuid } from 'uuid';

import { useState, useEffect } from 'react';
import { AddShoppingCart, HdrStrong } from '@material-ui/icons';

Amplify.configure(awsconfig);

function App() {
  const [listfiles, setlistfiles] = useState([]);
  const [filePlaying, setfilePlaying] = useState('');
  const [fileURL, setfileURL] = useState('');
  const [showaddfile, setshowaddfile] = useState(false);

  useEffect(() => {
    fetchfiles();
  }, []);

  const toggleSong = async (idx) => {
    if (filePlaying === idx) {
      setfilePlaying('');
      return;
    }

    const filePath = listfiles[idx].filepath;

    try {
      const fileAccessURL = await Storage.get(filePath, { expires: 60 });
      console.log(filePath);
      setfilePlaying(idx);
      setfileURL(fileAccessURL);
      return;
    } catch (error) {
      console.error('error accessing the file from s3', error);
      setfileURL('');
      setfilePlaying('');
    }
  };

  const fetchfiles = async () => {
    try {
      const apicall = await API.graphql(graphqlOperation(listFiles));
      const item = apicall.data.listFiles.items;
      setlistfiles(item);
      console.log(item);
    }
    catch (error) {
      console.log(error);
    }
  }

  const addLike = async (idx) => {
    try {
      const file = listfiles[idx];
      file.like = file.like + 1;
      delete file.createdAt;
      delete file.updatedAt;

      const fileData = await API.graphql(graphqlOperation(updateFile, { input: file }));
      const fileList = [...listfiles];
      fileList[idx] = fileData.data.updateFile; //
      setlistfiles(fileList);
    } catch (error) {
      console.log('error on adding Like to song', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <AmplifySignOut />
        <h2>Upload MP3 FILES</h2>
      </header>
      <div className="fileList">
        {listfiles.map((file, idx) => {
          return (
            <Paper variant="outlined" elevation={2} key={`song${idx}`}>
              <div className="fileCard">
                <IconButton aria-label="play" onClick={() => toggleSong(idx)}>
                  {filePlaying === idx ? <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
                <div>
                  <div className="fileTitle">{file.title}</div>
                  <div className="fileOwner">{file.owner}</div>
                </div>
                <div>
                  <IconButton aria-label="like" onClick={() => addLike(idx)} >
                    <FavoriteIcon />
                  </IconButton>
                  {file.like}
                </div>
                <div className="songDescription">{file.description}</div>
              </div>
              {filePlaying === idx ? (
                <div className="ourPlayer">
                  <ReactPlayer
                    url={fileURL}
                    controls
                    playing
                    height="50px"
                    onPause={() => toggleSong(idx)}
                  />
                </div>
              ) : null}
            </Paper>
          );
        })}
        {
          showaddfile ? (
            <Addfile onUpload={() => {
              setshowaddfile(false);
              fetchfiles();
            }} />
          ) :
            <IconButton onClick={() => setshowaddfile(true)}>
              <AddIcon />
            </IconButton>
        }
      </div>
    </div>
  );
}

export default withAuthenticator(App);

const Addfile = ({ onUpload }) => {
  const [songData, setSongData] = useState({});
  const [mp3Data, setMp3Data] = useState();

  const uploadFile = async () => {
    //Upload the song
    console.log('songData', songData);
    const { title, description, owner } = songData;

    const { key } = await Storage.put(`${uuid()}.mp3`, mp3Data, { contentType: 'audio/mp3' });

    const createSongInput = {
      id: uuid(),
      title,
      description,
      owner,
      filepath: key,
      like: 0,
    };
    await API.graphql(graphqlOperation(createFile, { input: createSongInput }));
    onUpload();
  };

  return (
    <div className="newFile">
      <TextField
        label="title"
        value={songData.title}
        onChange={e => setSongData({ ...songData, title: e.target.value })}
      />
      <TextField
        label="Owner"
        value={songData.owner}
        onChange={e => setSongData({ ...songData, owner: e.target.value })}
      />
      <TextField
        label="Description"
        value={songData.description}
        onChange={e => setSongData({ ...songData, description: e.target.value })}
      />
      <input type="file" accept="audio/mp3" onChange={e => setMp3Data(e.target.files[0])} />
      <IconButton onClick={uploadFile}>
        <PublishIcon />
      </IconButton>
    </div>
  );
};