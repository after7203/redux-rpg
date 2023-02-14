import { RootState } from 'Modules/index'
import { moveDungeon, moveVillage } from 'Modules/mode'
import { module_enemy } from 'Modules/enemy'
import { module_player } from 'Modules/player'
import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux/es/exports'
import Monsters from 'DataBase/monster'
import './ReduxRPG.scss'

const ReduxRPG = () => {
    const mode = useSelector((state: RootState) => state.mode)
    const player = useSelector((state: RootState) => state.player)
    const enemy = useSelector((state: RootState) => state.enemy)
    type Log = {
        name: 'encounter' | 'player_attack' | 'enemy_attack' | 'player_crit' | 'enemy_miss' | 'win' | 'lose' | 'gold_get',
        payload?: number
    }
    const [logs, setLogs] = useState<Log[]>([])
    const ref_player = useRef<HTMLImageElement>(null)
    const ref_enemy = useRef<HTMLImageElement>(null)
    const ref_btn_attck = useRef<HTMLDivElement>(null)
    const ref_btn_back = useRef<HTMLDivElement>(null)
    const ref_player_damaged = useRef<HTMLDivElement>(null)
    const ref_enemy_damaged = useRef<HTMLDivElement>(null)
    const ref_player_hp = useRef<HTMLDivElement>(null)
    const ref_enemy_hp = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    useEffect(() => {
        // console.log(mode)
        if (mode.name === 'village') {
            setDgBtnVisible(false)
        }
        else if (mode.name === 'dungeon') {
            const monsters = Monsters[mode.dungeon]
            // console.log(monsters)
            const select = Math.floor(Math.random() * monsters.length);
            const monster = monsters[select]
            dispatch(module_enemy.initailize(monster))
            addLog({ name: 'encounter' })
        }
    }, [mode])
    // useEffect(() => {
    //     console.log(enemy)
    // }, [enemy])
    const addLog = (new_log: Log) => {
        setLogs(prev_logs => {
            if (prev_logs.length >= 7) {
                return [...prev_logs.slice(1), new_log]
            }
            else {
                return [...prev_logs, new_log]
            }
        })
    }
    const attack = async () => {
        ref_btn_attck.current?.classList.add('invalid');
        ref_player.current?.classList.remove("fight");
        void ref_player.current?.offsetWidth;
        ref_player.current?.classList.add('fight');
        let player_damage = Math.round((Math.random() * 0.4 + 0.8) * player.atk);
        if (Math.random() > player.crit) {
            addLog({ name: 'player_attack', payload: player_damage })
            if (ref_enemy_damaged.current) ref_enemy_damaged.current.innerText = player_damage.toString();
        }
        else {
            player_damage = Math.round(player_damage * 1.8);
            ref_enemy_damaged.current?.classList.add('crit');
            if (ref_enemy_damaged.current) ref_enemy_damaged.current.innerText = player_damage.toString() + '!';
            addLog({ name: 'player_crit', payload: player_damage })
        }
        const percent = (enemy.hp - player_damage) / enemy.maxHp * 100
        if (ref_enemy_hp.current) {
            if (percent > 0) {
                ref_enemy_hp.current.style.width = `${percent}%`
            }
            else {
                ref_enemy_hp.current.style.visibility = `hidden`
            }
        }
        dispatch(module_enemy.damaged(player_damage));
        await delay(1000);
        if (ref_enemy_damaged.current) ref_enemy_damaged.current.innerText = '';
        ref_enemy_damaged.current?.classList.remove('crit');
        if (player_damage >= enemy.hp) {
            ref_enemy.current?.classList.add('die');
            ref_enemy.current && (ref_enemy.current.src = require(`Asset/${enemy.dead}`));
            addLog({ name: 'win' })
            const earnd_gold = Math.round((Math.random() * 0.5 + 1) * enemy.gold)
            addLog({ name: 'gold_get', payload: earnd_gold })
            dispatch(module_player.earn(earnd_gold));
            if (ref_btn_back.current) ref_btn_back.current.innerText = '뒤로';
        }
        else {
            attacked()
        }
    }
    const attacked = async () => {
        ref_enemy.current?.classList.remove("fight");
        void ref_enemy.current?.offsetWidth;
        ref_enemy.current?.classList.add('fight');
        let enemy_damage = Math.round((Math.random() * 0.4 + 0.8) * enemy.atk);
        if (Math.random() > player.miss) {
            addLog({ name: 'enemy_attack', payload: enemy_damage })
            if (ref_player_damaged.current) ref_player_damaged.current.innerText = enemy_damage.toString();
            if (ref_player_hp.current) ref_player_hp.current.style.width = `${(player.hp - enemy_damage) / player.maxHp * 100}%`
            const percent = (player.hp - enemy_damage) / player.maxHp * 100
            if (ref_player_hp.current) {
                if (percent > 0) {
                    ref_player_hp.current.style.width = `${percent}%`
                }
                else {
                    ref_player_hp.current.style.visibility = `hidden`
                }
            }
            dispatch(module_player.damaged(enemy_damage));
        }
        else {
            enemy_damage = 0;
            addLog({ name: 'enemy_miss' })
        }
        await delay(1000);
        if (ref_player_damaged.current) ref_player_damaged.current.innerText = '';
        if (enemy_damage >= player.hp) {
            ref_player.current?.classList.add('die');
            ref_player.current && (ref_player.current.src = require(`Asset/player-dead.png`));
            addLog({ name: 'lose' })
        }
        else {
            ref_btn_attck.current?.classList.remove('invalid');
        }
    }
    const delay = (ms: number) => new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
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
                            <h3>{player.atk}</h3><h3>{player.hp}/{player.maxHp}</h3>
                        </div>
                    </div>
                    <div className="gold d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-2 rounded m-2 bg-opacity-75 align-items-center justify-content-end">
                        <h2 className='m-0 mt-1 text-warning'>{player.gold}</h2>
                        <img className='ms-4 pixel' src={require('Asset/coin.png')} style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div className="items container">
                        <div className="row">
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-weapon.png')} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-shield.png')} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-amor.png')} alt="" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-item.png')} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-item.png')} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' src={require('Asset/default-item.png')} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div id='screen' className="p-2 position-relative">
                    {mode.name === 'village' &&
                        <div id="village" className='border border-dark border-3 my-shadow rounded w-100 h-100'>
                            <img className='img-full' src={require('Asset/village.jpg')} alt="" />
                            <img className='player pixel position-absolute translate-middle top-50 start-50' src={require('Asset/player.gif')} alt="" />
                            <div className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', left: '50px' }}>
                                상점
                            </div>
                            <div onClick={() => setDgBtnVisible(prev => !prev)} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', right: '50px' }}>
                                사냥
                            </div>
                            {dgBtnVisible &&
                                <div className='position-absolute' style={{ bottom: '110px', right: '50px' }}>
                                    <div onClick={() => dispatch(moveDungeon('slime-feild'))} className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
                                        슬라임 숲
                                    </div>
                                    <div onClick={() => dispatch(moveDungeon('golem-canyon'))} className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
                                        골렘 협곡
                                    </div>
                                    <div onClick={() => dispatch(moveDungeon('wyvern-cave'))} className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
                                        와이번 굴
                                    </div>
                                </div>
                            }
                        </div>
                    }
                    {mode.name === 'dungeon' &&
                        <div id="dungeon" className='border position-relative border-dark border-3 my-shadow rounded w-100 h-100'>
                            <img className='img-full pixel' src={require('Asset/slime-field.png')} alt="" />
                            <img id='player-fight' ref={ref_player} className='pixel position-absolute translate-middle' src={require('Asset/player-fight.gif')} alt="" />
                            <div id="player-damaged" ref={ref_player_damaged} className='activate position-absolute translate-middle text-shadow text-warning d-flex justify-content-center align-items-center'></div>
                            <div id="player-maxhp" className="border border-dark border-3 position-absolute translate-middle bg-warning bg-gradient rounded p-0" >
                                <div id="player-hp" ref={ref_player_hp} className="border border-dark border-3 bg-danger bg-gradient rounded p-0" />
                            </div>
                            <img id='enemy' ref={ref_enemy} className='pixel position-absolute translate-middle' src={require(`Asset/${enemy.img}`)} alt="" />
                            <div id="enemy-damaged" ref={ref_enemy_damaged} className='activate position-absolute translate-middle text-shadow text-danger d-flex justify-content-center align-items-center'></div>
                            <div id="enemy-maxhp" className="border border-dark border-3 position-absolute translate-middle bg-warning bg-gradient rounded p-0" >
                                <div id="enemy-hp" ref={ref_enemy_hp} className="border border-dark border-3 bg-danger bg-gradient rounded p-0" />
                            </div>
                            <div className="border border-dark border-3 position-absolute bg-secondary bg-gradient rounded p-2 bg-opacity-75 text-shadow text-white" style={{ top: '-3px', left: '-3px', width: '40%', height: '35%' }}>
                                {logs.map((log, idx) => {
                                    switch (log.name) {
                                        case 'encounter':
                                            return (
                                                <div key={idx}>
                                                    <span>{`${enemy.name}(을)를 만났다!`}</span>
                                                </div>
                                            )
                                        case 'player_attack':
                                            return (
                                                <div key={idx}>
                                                    <span>{'플레이어(이)가 공격!'}</span> <span className='text-danger'>{log.payload}</span><span>{'데미지'}</span>
                                                </div>
                                            )
                                        case 'enemy_attack':
                                            return (
                                                <div key={idx}>
                                                    <span>{`${enemy.name}(이)가 공격!`}</span> <span className='text-warning'>{log.payload}</span><span>{'데미지'}</span>
                                                </div>
                                            )
                                        case 'player_crit':
                                            return (
                                                <div key={idx}>
                                                    <span>{`플레이어(이)가 공격!`}</span> <span className='text-secondary'>{`<크리티컬!!>`}</span> <span className='text-danger'>{`${log.payload}`}</span><span>{'데미지'}</span>
                                                </div>
                                            )
                                        case 'enemy_miss':
                                            return (
                                                <div key={idx}>
                                                    <span>{`${enemy.name}(이)가 공격! 빗나갔다..!`}</span>
                                                </div>
                                            )
                                        case 'win':
                                            return (
                                                <div key={idx}>
                                                    <span>{`${enemy.name}(을)를 물리쳤다!!`}</span>
                                                </div>
                                            )
                                        case 'lose':
                                            return (
                                                <div key={idx}>
                                                    <span>{`으윽 너무 강하다..`}</span>
                                                </div>
                                            )
                                        case 'gold_get':
                                            return (
                                                <div key={idx}>
                                                    <span style={{ color: 'orange' }}>{log.payload}</span><span>{`골드 획득!`}</span>
                                                </div>
                                            )
                                        default:
                                            return
                                    }
                                })}
                            </div>
                            <div onClick={() => { dispatch(moveVillage()); setLogs([]); dispatch(module_player.initailize()); }} ref={ref_btn_back} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', left: '50px' }}>
                                도망
                            </div>
                            <div onClick={attack} ref={ref_btn_attck} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', right: '50px' }}>
                                공격
                            </div>
                        </div>

                    }
                </div>
                <div id="right" className='p-2'>
                    <div id='enemy-interface' className="d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-4 rounded flex-fill bg-opacity-75">
                        {mode.name === 'dungeon' &&
                            <div className='d-flex flex-column w-100'>
                                <h3 className='m-2 mb-4'>{enemy.name}</h3>
                                <div className="d-flex">
                                    <div className='d-flex flex-column m-2'>
                                        <h3>공격력: </h3><h3>체력: </h3>
                                    </div>
                                    <div className='d-flex flex-column flex-fill align-items-end m-2'>
                                        <h3>{enemy.atk}</h3><h3>{enemy.hp}/{enemy.maxHp}</h3>
                                    </div>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReduxRPG