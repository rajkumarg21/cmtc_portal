import React from 'react';
import { Link } from 'react-router-dom';

const MenuItem = ({ item }) => {
  return (
    <li>
      <Link to={`/pages/${item.slug}`} className="hover:underline">
        {item.titleEnglish}
      </Link>

      {item.children && item.children.length > 0 && (
        <ul className="ml-4 pl-2 border-l border-gray-300">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  );
};

export default MenuItem;
