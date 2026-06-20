import React from 'react';
import SpacesMap from '../../components/features/spaces/SpacesMap';

export default function SpacesPage({ user, socket, API_BASE }) {
  return (
    <SpacesMap 
      user={user} 
      socket={socket} 
      API_BASE={API_BASE} 
    />
  );
}
