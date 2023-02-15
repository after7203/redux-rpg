import { RootState } from 'Modules/index'
import { moveDungeon, moveShop, moveVillage } from 'Modules/mode'
import { module_enemy } from 'Modules/enemy'
import { module_player } from 'Modules/player'
import { useEffect, useState, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useDispatch } from 'react-redux/es/exports'
import Monsters from 'DataBase/monster'
import Items from 'DataBase/items'
import './ReduxRPG.scss'

const ReduxRPG = () => {
    const mode = useSelector((state: RootState) => state.mode)
    const player = useSelector((state: RootState) => state.player)
    const enemy = useSelector((state: RootState) => state.enemy)
    type Log = {
        name: 'encounter' | 'player_attack' | 'enemy_attack' | 'player_crit' | 'enemy_miss' | 'win' | 'lose' | 'gold_get' | 'item_get',
        payload?: number | string
    }
    const [logs, setLogs] = useState<Log[]>([])
    type Tooltip = {
        type: 'interface' | 'gold' | 'item',
        part?: number,
        tier?: number,
    }
    const [tooltipInfo, setTooltipInfo] = useState<Tooltip>()
    const ref_player = useRef<HTMLImageElement>(null)
    const ref_enemy = useRef<HTMLImageElement>(null)
    const ref_btn_attck = useRef<HTMLDivElement>(null)
    const ref_btn_back = useRef<HTMLDivElement>(null)
    const ref_player_damaged = useRef<HTMLDivElement>(null)
    const ref_enemy_damaged = useRef<HTMLDivElement>(null)
    const ref_player_hp = useRef<HTMLDivElement>(null)
    const ref_enemy_hp = useRef<HTMLDivElement>(null)
    const ref_tooltip = useRef<HTMLDivElement>(null)
    const dispatch = useDispatch()
    useEffect(() => {
        if (mode.name === 'village') {
            setDgBtnVisible(false)
        }
        else if (mode.name === 'dungeon') {
            const monsters = Monsters[mode.dungeon]
            const select = Math.floor(Math.random() * monsters.length);
            const monster = monsters[select]
            if (['와이번', '아이스 와이번', '파이어 와이번'].includes(monster.name)) {
                ref_enemy.current && (ref_enemy.current.style.width = '400px');
            }
            dispatch(module_enemy.initailize(monster))
            addLog({ name: 'encounter' })
        }
    }, [mode])
    useEffect(() => {
        window.addEventListener('mousemove', moveTooltip)
        return () => {
            window.removeEventListener("mousemove", moveTooltip);
        }
    }, [])
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
        if (ref_btn_attck.current?.classList.contains('invalid')) return;
        ref_btn_attck.current?.classList.add('invalid');
        ref_player.current?.classList.remove("fight");
        void ref_player.current?.offsetWidth;
        ref_player.current?.classList.add('fight');
        let player_damage = (Math.random() * 0.4 + 0.8) * player.atk * (player.atk_amp + 1);
        if (Math.random() > player.crit) {
            player_damage = Math.round(player_damage)
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
            if (enemy.name === '킹 슬라임' && player.equip[3] === 0) {
                dispatch(module_player.equip(Items[3][1]))
                addLog({ name: 'item_get', payload: Items[3][1].name })
            }
            else if (enemy.name === '언데드 골렘' && player.equip[4] === 0) {
                dispatch(module_player.equip(Items[4][1]))
                addLog({ name: 'item_get', payload: Items[4][1].name })
            }
            else if (enemy.name === '에인션트 와이번' && player.equip[5] === 0) {
                dispatch(module_player.equip(Items[5][1]))
                addLog({ name: 'item_get', payload: Items[5][1].name })
            }
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
        let enemy_damage = Math.round((Math.random() * 0.4 + 0.8) * enemy.atk * (1 - player.def_amp));
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
    const moveTooltip = (e: MouseEvent) => {
        if (ref_tooltip.current) {
            ref_tooltip.current.style.left = e.clientX + 35 + 'px';
            if (e.clientY + 40 + ref_tooltip.current.offsetHeight <= 929) {
                ref_tooltip.current.style.top = e.clientY + 40 + 'px';
            }
            else {
                ref_tooltip.current.style.top = 929 - ref_tooltip.current.offsetHeight + 'px'
            }
        }
    }
    const setVisibleTT = (tooltip: Tooltip) => {
        if (ref_tooltip.current) {
            ref_tooltip.current.classList.add('visible')
            ref_tooltip.current.classList.remove('invisible')
        }
        setTooltipInfo(tooltip)
    }
    const setInvisibleTT = () => {
        if (ref_tooltip.current) {
            ref_tooltip.current.classList.add('invisible')
            ref_tooltip.current.classList.remove('visible')
        }
    }
    const [dgBtnVisible, setDgBtnVisible] = useState(false)
    return (
        <div className="vw-100 vh-100 d-flex justify-content-center align-items-center">
            <img className="vw-100 vh-100 background opacity-25 position-absolute" src={require('Asset/background.jpg')} alt="" />
            <div className="game d-flex">
                <div id='left' className="d-flex flex-column">
                    <div id='user-interface' onMouseEnter={() => setVisibleTT({ type: 'interface' })} onMouseLeave={setInvisibleTT} className="d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-4 rounded m-2 flex-fill bg-opacity-75">
                        <div className='d-flex flex-column'>
                            <h4>공격력: </h4><h4>체력: </h4><h4>크리티컬 확률: </h4><h4>회피율: </h4>
                        </div>
                        <div className='d-flex flex-column flex-fill align-items-end'>
                            <h4>{Math.round(player.atk * (player.atk_amp + 1))}</h4><h4>{player.hp}/{player.maxHp}</h4><h4>{player.crit * 100}%</h4><h4>{player.miss * 100}%</h4>
                        </div>
                    </div>
                    <div onMouseEnter={() => setVisibleTT({ type: 'gold' })} onMouseLeave={setInvisibleTT} className="gold d-flex my-shadow text-white text-shadow border border-dark border-3 bg-secondary bg-gradient p-2 rounded m-2 bg-opacity-75 align-items-center justify-content-end">
                        <h2 className='m-0 mt-1 text-warning'>{player.gold}</h2>
                        <img className='ms-4 pixel' src={require('Asset/coin.png')} style={{ width: '32px', height: '32px' }} />
                    </div>
                    <div className="items container">
                        <div className="row">
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' onMouseEnter={() => player.equip[0] !== 0 && setVisibleTT({ type: 'item', part: 0, tier: player.equip[0] })} onMouseLeave={setInvisibleTT} src={player.equip[0] === 0 ? require('Asset/default-weapon.png') : require(`Asset/${Items[0][player.equip[0]].img}`)} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' onMouseEnter={() => player.equip[1] !== 0 && setVisibleTT({ type: 'item', part: 1, tier: player.equip[1] })} onMouseLeave={setInvisibleTT} src={player.equip[1] === 0 ? require('Asset/default-shield.png') : require(`Asset/${Items[1][player.equip[1]].img}`)} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-secondary bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' onMouseEnter={() => player.equip[2] !== 0 && setVisibleTT({ type: 'item', part: 2, tier: player.equip[2] })} onMouseLeave={setInvisibleTT} src={player.equip[2] === 0 ? require('Asset/default-amor.png') : require(`Asset/${Items[2][player.equip[2]].img}`)} alt="" />
                            </div>
                        </div>
                        <div className="row">
                            <div className="item col my-shadow border border-dark border-3 bg-info bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' onMouseEnter={() => player.equip[3] !== 0 && setVisibleTT({ type: 'item', part: 3, tier: player.equip[3] })} onMouseLeave={setInvisibleTT} src={player.equip[3] === 0 ? require('Asset/default-item.png') : require(`Asset/${Items[3][player.equip[3]].img}`)} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-info bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' onMouseEnter={() => player.equip[4] !== 0 && setVisibleTT({ type: 'item', part: 4, tier: player.equip[4] })} onMouseLeave={setInvisibleTT} src={player.equip[4] === 0 ? require('Asset/default-item.png') : require(`Asset/${Items[4][player.equip[4]].img}`)} alt="" />
                            </div>
                            <div className="item col my-shadow border border-dark border-3 bg-info bg-gradient rounded m-2 p-0 bg-opacity-75" >
                                <img className='pixel img-full' onMouseEnter={() => player.equip[5] !== 0 && setVisibleTT({ type: 'item', part: 5, tier: player.equip[5] })} onMouseLeave={setInvisibleTT} src={player.equip[5] === 0 ? require('Asset/default-item.png') : require(`Asset/${Items[5][player.equip[5]].img}`)} alt="" />
                            </div>
                        </div>
                    </div>
                </div>
                <div id='screen' className="p-2 position-relative">
                    {mode.name === 'village' &&
                        <div id="village" className='position-relative border border-dark border-3 my-shadow rounded w-100 h-100'>
                            <img className='img-full' src={require('Asset/village.jpg')} alt="" />
                            <img className='player pixel position-absolute translate-middle top-50 start-50' src={require('Asset/player.gif')} alt="" />
                            <div onClick={() => dispatch(moveShop())} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', left: '50px' }}>
                                상점
                            </div>
                            <div onClick={() => setDgBtnVisible(prev => !prev)} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', right: '50px' }}>
                                사냥
                            </div>
                            {dgBtnVisible &&
                                <div className='position-absolute' style={{ bottom: '110px', right: '50px' }}>
                                    <div onClick={() => dispatch(moveDungeon('slime-field'))} className="my-btn border border-dark border-3 bg-primary bg-warning rounded p-0 bg-opacity-75 text-shadow">
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
                    {mode.name === 'shop' &&
                        <div id="shop" className='position-relative border border-dark border-3 my-shadow rounded w-100 h-100'>
                            <img className='img-full' src={require('Asset/shop.jpg')} alt="" />
                            <div className='d-flex flex-column justify-content-between align-items-center position-absolute w-100 h-100 top-0 left-0 p-5'>
                                {Items.map((items, i) => {
                                    if (i >= 3)
                                        return
                                    else
                                        return (
                                            <div key={i} className='d-flex align-items-center'>
                                                {items.map((item, j) => {
                                                    if (j === 0)
                                                        return
                                                    else
                                                        return (
                                                            <div key={j} className='shop-item d-flex flex-column'>
                                                                <img onMouseEnter={() => setVisibleTT({ type: 'item', part: i, tier: j })} onMouseLeave={setInvisibleTT} src={require(`Asset/${item.img}`)} className="pixel border border-dark border-3 bg-success bg-gradient rounded p-0" style={{ width: '100px', height: '100px' }} />
                                                                <div onClick={() => { if (player.gold >= Items[i][j].gold) dispatch(module_player.equip(Items[i][j])); }} className="my-btn d-flex justify-content-center align-items-center border border-dark border-3 bg-secondary bg-gradient rounded p-0" style={{ width: '100px', height: '40px', marginTop: '-3px' }} >
                                                                    <h4 className='m-0 mt-1 text-shadow text-warning'>{item.gold}</h4>
                                                                    <img className='ms-1 pixel' src={require('Asset/coin.png')} style={{ width: '22px', height: '22px' }} />
                                                                </div>
                                                            </div>
                                                        )
                                                })}
                                            </div>
                                        )
                                })}
                            </div>
                            <div onClick={() => { dispatch(moveVillage()) }} className="my-btn border border-dark border-3 position-absolute bg-primary bg-gradient rounded p-0 bg-opacity-75 text-shadow" style={{ bottom: '50px', left: '50px' }}>
                                뒤로
                            </div>
                        </div>
                    }
                    {mode.name === 'dungeon' &&
                        <div id="dungeon" className='d-flex justify-content-between border position-relative border-dark border-3 my-shadow rounded w-100 h-100'>
                            <img className='img-full pixel position-absolute' src={require(`Asset/${mode.dungeon}.png`)} alt="" />
                            <div className='d-flex flex-column justify-content-end' style={{ marginLeft: '250px', marginBottom: '130px', zIndex: 10 }}>
                                <div id="player-damaged" ref={ref_player_damaged} className='d-flex justify-content-center align-items-center text-shadow text-warning' />
                                <img id='player-fight' ref={ref_player} className='pixel position-relative' src={require('Asset/player-fight.gif')} alt="" />
                                <div id="player-maxhp" className="border border-dark border-3 bg-warning bg-gradient rounded p-0" >
                                    <div id="player-hp" ref={ref_player_hp} className="border border-dark border-3 bg-danger bg-gradient rounded p-0" />
                                </div>
                            </div>
                            <div className='d-flex flex-column justify-content-end align-items-end' style={{ marginRight: '250px', marginBottom: '130px', zIndex: 10 }}>
                                <div id="enemy-damaged" ref={ref_enemy_damaged} className='text-shadow text-danger d-flex justify-content-center align-items-center' />
                                <div className='d-flex justify-content-center' style={{ width: '128px' }}>
                                    <img id='enemy' ref={ref_enemy} className='pixel' src={require(`Asset/${enemy.img}`)} alt="" />
                                </div>
                                <div id="enemy-maxhp" className="flex-shrink-0 border border-dark border-3 bg-warning bg-gradient rounded p-0" >
                                    <div id="enemy-hp" ref={ref_enemy_hp} className="border border-dark border-3 bg-danger bg-gradient rounded p-0" />
                                </div>
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
                                        case 'item_get':
                                            return (
                                                <div key={idx}>
                                                    <span style={{ color: 'orange' }}>{log.payload}</span><span>{`(을)를 획득!`}</span>
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
                <div ref={ref_tooltip} id='tooltip' className="invisible border border-dark border-3 w-auto h-auto position-absolute bg-secondary bg-opacity-75 bg-gradient rounded p-2 text-shadow text-white">
                    {tooltipInfo?.type === 'interface' &&
                        <h4>
                            공격시 공격력의 80%~120%의 피해를 줍니다<br /><br />
                            체력이 0이 되면 패배합니다<br /><br />
                            크리티컬 발동시 180%의 피해를 줍니다<br /><br />
                            회피시 피해를 받지않습니다
                        </h4>
                    }
                    {tooltipInfo?.type === 'gold' &&
                        <h4>골드로 상점에서 장비를 구입할 수 있습니다</h4>
                    }
                    {tooltipInfo?.type === 'item' && tooltipInfo.part !== undefined && tooltipInfo.tier &&
                        <>
                            <h4>{Items[tooltipInfo.part][tooltipInfo.tier].name}</h4><br />
                            {Items[tooltipInfo.part][tooltipInfo.tier].atk !== 0 && <h4>공격력 +{Items[tooltipInfo.part][tooltipInfo.tier].atk}</h4>}
                            {Items[tooltipInfo.part][tooltipInfo.tier].maxHp !== 0 && <h4>체력 +{Items[tooltipInfo.part][tooltipInfo.tier].maxHp}</h4>}
                            {Items[tooltipInfo.part][tooltipInfo.tier].atk_amp !== 0 && <h4>공격력 증폭 +{Items[tooltipInfo.part][tooltipInfo.tier].atk_amp * 100}%</h4>}
                            {Items[tooltipInfo.part][tooltipInfo.tier].def_amp !== 0 && <h4>방어율 +{Items[tooltipInfo.part][tooltipInfo.tier].def_amp * 100}%</h4>}
                            {Items[tooltipInfo.part][tooltipInfo.tier].crit !== 0 && <h4>크리티컬 확률 +{Items[tooltipInfo.part][tooltipInfo.tier].crit * 100}%</h4>}
                            <br />
                            <h4>{Items[tooltipInfo.part][tooltipInfo.tier].desc}</h4>
                        </>
                    }
                </div>
            </div>
        </div >
    )
}

export default ReduxRPG