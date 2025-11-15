import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = ({ type = 'text', count = 1 }) => {
  const skeletons = Array.from({ length: count }, (_, i) => (
    <div key={i} className={`skeleton ${type}`}></div>
  ));
  return <>{skeletons}</>;
};

export default SkeletonLoader;
