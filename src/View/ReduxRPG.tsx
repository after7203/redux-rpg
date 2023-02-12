import { RootState } from 'Modules'
import { moveDungeon } from 'Modules/mode'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux/es/exports'
import './ReduxRPG.scss'

const ReduxRPG = () => {
    const mode = useSelector((state: RootState) => state.mode)
    useEffect(() => {
        console.log(mode)
    }, [mode])
    const dispatch = useDispatch()
    const [dgBtnVisible, setDgBtnVisible] = useState(false)
    return (
        <div className="vw-100 vh-100 d-flex justify-content-center align-items-center">
            <img className="background opacity-25 position-absolute" src={require('Asset/background.jpg')} alt="" />
            <div className="game d-flex">
                <div id='left' className="d-flex flex-column">
                    <div id='user-interface' className="d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-4 rounded m-2 flex-fill bg-opacity-75">
                        <div className='d-flex flex-column m-2'>
                            <h3>공격력: </h3><h3>체력: </h3>
                        </div>
                        <div className='d-flex flex-column flex-fill align-items-end m-2'>
                            <h3>{5}</h3><h3>{10}</h3>
                        </div>
                    </div>
                    <div className="gold d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-2 rounded m-2 bg-opacity-75 align-items-center justify-content-end">
                        <h2 className='m-0 mt-1'>{0}</h2>
                        <img className='ms-4 pixel' src={require('Asset/coin.png')} style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div className="items container">
                        <div className="row">
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-weapon.png')} />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-shield.png')} />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-amor.png')} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-item.png')} />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-item.png')} />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-item.png')} />
                            </div>
                        </div>
                    </div>
                </div>
                <div id='screen' className="p-2 position-relative">
                    <div id="village" className='border border-dark border-3 my-shadow rounded w-100 h-100'>
                        <img className='img-full' src={require('Asset/village.jpg')} />
                        <img className='player pixel position-absolute translate-middle top-50 start-50' src={require('Asset/player.png')} />
                        <div className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', left: '50px' }}>
                            상점
                        </div>
                        <div onClick={() => setDgBtnVisible(prev => !prev)} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', right: '50px' }}>
                            사냥
                        </div>
                        {dgBtnVisible &&
                            <div className='position-absolute' style={{ bottom: '110px', right: '50px' }}>
                                <div onClick={() => dispatch(moveDungeon())} className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
                                    슬라임 숲
                                </div>
                                <div className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
                                    골렘 협곡
                                </div>
                                <div className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
                                    와이번 던전
                                </div>
                            </div>
                        }
                    </div>
                    <div id="dungeon" className='border border-dark border-3 my-shadow rounded w-100 h-100'>
                        <img className='img-full' src={require('Asset/slime-field.png')} />
                    </div>
                </div>
                <div id="right" className='p-2'>
                    <div id='enemy-interface' className="d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-4 rounded flex-fill bg-opacity-75">
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReduxRPG