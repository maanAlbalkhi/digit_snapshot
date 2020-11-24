import React from 'react'

import './styles/ProgressBar.scss'

function ProgressBar({total, finished} : {finished: number, total: number}) {
  return(
    <div className='progress-bar'>
      <div className='outer'>
        <div className='inner' style={{width: `${finished/total*100}%` }}></div>
      </div>
      <p>{finished} / {total}</p>
    </div>  
    
  )
}

export { ProgressBar }