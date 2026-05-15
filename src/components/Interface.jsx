import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Tooltip from "@mui/material/Tooltip";
import Drawer from "@mui/material/Drawer";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import Menu from "@mui/material/Menu";
import Backdrop from "@mui/material/Backdrop";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import { MuiColorInput } from "mui-color-input";
import PlayArrow from "@mui/icons-material/PlayArrow";
import Settings from "@mui/icons-material/Settings";
import Movie from "@mui/icons-material/Movie";
import Pause from "@mui/icons-material/Pause";
import Replay from "@mui/icons-material/Replay";
import MapIcon from "@mui/icons-material/Map";
import TravelExplore from "@mui/icons-material/TravelExplore";
import Slider from "./Slider";
import { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { INITIAL_COLORS, LOCATIONS } from "../config";
import { arrayToRgb, rgbToArray } from "../helpers";

const Interface = forwardRef(({ canStart, started, animationEnded, playbackOn, time, maxTime, settings, colors, loading, timeChanged, cinematic, placeEnd, changeRadius, changeAlgorithm, setPlaceEnd, setCinematic, setSettings, setColors, startPathfinding, toggleAnimation, clearPath, changeLocation }, ref) => {
    const [sidebar, setSidebar] = useState(false);
    const [snack, setSnack] = useState({
        open: false,
        message: "",
        type: "error",
    });
    const [showTutorial, setShowTutorial] = useState(false);
    const [activeStep, setActiveStep] = useState(0);
    const [helper, setHelper] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const menuOpen = Boolean(menuAnchor);
    const helperTime = useRef(4800);
    const rightDown = useRef(false);
    const leftDown = useRef(false);

    // Expose showSnack to parent from ref
    useImperativeHandle(ref, () => ({
        showSnack(message, type = "error") {
            setSnack({ open: true, message, type });
        },
    }));
      
    function closeSnack() {
        setSnack({...snack, open: false});
    }

    function closeHelper() {
        setHelper(false);
    }

    function handleTutorialChange(direction) {
        if(activeStep >= 2 && direction > 0) {
            setShowTutorial(false);
            return;
        }
        
        setActiveStep(Math.max(activeStep + direction, 0));
    }

    // Start pathfinding or toggle playback
    function handlePlay() {
        if(!canStart) return;
        if(!started && time === 0) {
            startPathfinding();
            return;
        }
        toggleAnimation();
    }
    
    function closeMenu() {
        setMenuAnchor(null);
    }

    window.onkeydown = e => {
        if(e.code === "ArrowRight" && !rightDown.current && !leftDown.current && (!started || animationEnded)) {
            rightDown.current = true;
            toggleAnimation(false, 1);
        }
        else if(e.code === "ArrowLeft" && !leftDown.current && !rightDown.current && animationEnded) {
            leftDown.current = true;
            toggleAnimation(false, -1);
        }
    };

    window.onkeyup = e => {
        if(e.code === "Escape") setCinematic(false);
        else if(e.code === "Space") {
            e.preventDefault();
            handlePlay();
        }
        else if(e.code === "ArrowRight" && rightDown.current) {
            rightDown.current = false;
            toggleAnimation(false, 1);
        }
        else if(e.code === "ArrowLeft" && animationEnded && leftDown.current) {
            leftDown.current = false;
            toggleAnimation(false, 1);
        }
        else if(e.code === "KeyR" && (animationEnded || !started)) clearPath();
    };

    // Show cinematic mode helper
    useEffect(() => {
        if(!cinematic) return;
        setHelper(true);
        setTimeout(() => {
            helperTime.current = 2500;
        }, 200);
    }, [cinematic]);

    useEffect(() => {
        if(localStorage.getItem("path_sawtutorial")) return;
        setShowTutorial(true);
        localStorage.setItem("path_sawtutorial", true);
    }, []);

    return (
        <>
            <div className={`nav-top ${cinematic ? "cinematic" : ""}`}>
                <div className="side slider-container">
                    <Typography id="playback-slider" gutterBottom>
                        Animation timeline
                    </Typography>
                    <Slider disabled={!animationEnded} value={animationEnded ? time : maxTime} min={animationEnded ? 0 : -1} max={maxTime} onChange={(e) => {timeChanged(Number(e.target.value));}} className="slider" aria-labelledby="playback-slider" />
                </div>
                <IconButton disabled={!canStart} onClick={handlePlay} className="play-btn" size="large">
                    {(!started || animationEnded && !playbackOn) 
                        ? <PlayArrow style={{ color: "#fff", width: 32, height: 32 }} fontSize="inherit" />
                        : <Pause style={{ color: "#fff", width: 32, height: 32 }} fontSize="inherit" />
                    }
                </IconButton>
                <div className="side">
                    <Button disabled={!animationEnded && started} onClick={clearPath} className="btn-secondary" variant="outlined">Clear map</Button>
                </div>
            </div>

            <div className={`nav-right ${cinematic ? "cinematic" : ""}`}>
                <Tooltip title="Open Settings" placement="left">
                    <IconButton onClick={() => {setSidebar(true);}} className="custom-icon-btn" size="large">
                        <Settings style={{ width: 24, height: 24 }} fontSize="inherit" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Cinematic View" placement="left">
                    <IconButton className="btn-cinematic custom-icon-btn" onClick={() => {setCinematic(!cinematic);}} size="large">
                        <Movie style={{ width: 24, height: 24 }} fontSize="inherit" />
                    </IconButton>
                </Tooltip>
            </div>

            <div className="loader-container">
                <Fade
                    in={loading}
                    style={{
                        transitionDelay: loading ? "50ms" : "0ms",
                    }}
                    unmountOnExit
                >
                    <CircularProgress size={50} thickness={4} />
                </Fade>
            </div>

            <Snackbar 
                anchorOrigin={{ vertical: "top", horizontal: "center" }} 
                open={snack.open} 
                autoHideDuration={4000} 
                onClose={closeSnack}
                style={{ top: 80 }}>
                <Alert 
                    onClose={closeSnack} 
                    severity={snack.type} 
                    variant="filled"
                    style={{ width: "100%", color: "#fff", borderRadius: 12, fontWeight: 500 }}
                >
                    {snack.message}
                </Alert>
            </Snackbar>

            <Snackbar 
                anchorOrigin={{ vertical: "top", horizontal: "center" }} 
                open={helper} 
                autoHideDuration={helperTime.current} 
                onClose={closeHelper}
                style={{ top: 80 }}
            >
                <div className="cinematic-alert">
                    <Typography fontSize="16px"><b>Cinematic mode activated</b></Typography>
                    <Typography fontSize="14px" style={{opacity: 0.8}}>Use keyboard shortcuts to control animation</Typography>
                    <Typography fontSize="13px" style={{opacity: 0.6}}>Press <b>Escape</b> to exit</Typography>
                </div>
            </Snackbar>

            <div className="mobile-controls">
                <Button onClick={() => {setPlaceEnd(!placeEnd);}} className="btn-primary" variant="contained">
                    <TravelExplore style={{ marginRight: 8 }} />
                    {placeEnd ? "Now Place Destination" : "Now Place Start"}
                </Button>
            </div>

            <Backdrop
                open={showTutorial}
                onClick={e => {if(e.target.classList.contains("backdrop")) setShowTutorial(false);}}
                className="backdrop"
                style={{ zIndex: 1000, backdropFilter: "blur(8px)" }}
            >
                <div className="tutorial-container">
                    <Stepper activeStep={activeStep}>
                        <Step>
                            <StepLabel>Basic controls</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Playback controls</StepLabel>
                        </Step>
                        <Step>
                            <StepLabel>Changing settings</StepLabel>
                        </Step>
                    </Stepper>
                    <div className="content">
                        <h1>Pathfinding Studio</h1>
                        {activeStep === 0 && <div>
                            <p>
                                <b>Controls:</b> <br/>
                                <b>Left Button:</b> Place start node <br/>
                                <b>Right Button:</b> Place end node <br/>
                            </p>
                            <p style={{opacity: 0.7}}>The end node must be placed within the highlighted radius area.</p>
                            <video className="video" autoPlay muted loop>
                                <source src="./videos/tutorial1.mp4" type="video/mp4"/>
                            </video>
                        </div>}
                        {activeStep === 1 && <div>
                            <p>
                                To start the algorithm visualization, press the big <b>Play Button</b> at the bottom or press <b>Space</b> on your keyboard.<br/>
                                A timeline playback feature is available once the path is fully discovered!
                            </p>
                            <video className="video" autoPlay muted loop>
                                <source src="./videos/tutorial2.mp4" type="video/mp4"/>
                            </video>
                        </div>}
                        {activeStep === 2 && <div>
                            <p>
                                You can customize everything (algorithms, area size, speeds, and style colors) in the <b>Settings Panel</b>. <br/>
                                <i>Tip:</i> Keep the area radius only as large as needed. Areas over <b>10km</b> are experimental and can be heavy on performance.
                            </p>
                            <video className="video" autoPlay muted loop>
                                <source src="./videos/tutorial3.mp4" type="video/mp4"/>
                            </video>
                        </div>}
                    </div>
                    <div className="controls">
                        <Button onClick={() => {setShowTutorial(false);}}
                            className="close btn-secondary" variant="outlined" 
                        >
                            Skip Tutorial
                        </Button>
                        <div style={{display: "flex", gap: "12px"}}>
                            <Button onClick={() => {handleTutorialChange(-1);}}
                                className="btn-secondary" variant="outlined"
                                disabled={activeStep === 0}
                            >
                                Back
                            </Button>
                            <Button onClick={() => {handleTutorialChange(1);}}
                                className="btn-primary" variant="contained"
                            >
                                {activeStep >= 2 ? "Get Started" : "Continue"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Backdrop>

            <Drawer
                className={`side-drawer ${cinematic ? "cinematic" : ""}`}
                anchor="left"
                open={sidebar}
                onClose={() => {setSidebar(false);}}
                ModalProps={{
                    keepMounted: true, 
                }}
            >
                <div className="sidebar-container">

                    <FormControl variant="filled" style={{ marginTop: 10 }}>
                        <Typography style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>Algorithm Engine</Typography>
                        <Select
                            labelId="algo-select"
                            value={settings.algorithm}
                            onChange={e => {changeAlgorithm(e.target.value);}}
                            required
                            style={{ backgroundColor: "rgba(255,255,255,0.05)", borderRadius: 12, color: "#fff", width: "100%" }}
                            inputProps={{MenuProps: {MenuListProps: {sx: {backgroundColor: "#1a1c23"}}}}}
                            disableUnderline
                            disabled={!animationEnded && started}
                        >
                            <MenuItem value={"astar"}>A* Search Algorithm</MenuItem>
                            <MenuItem value={"greedy"}>Greedy Best-First</MenuItem>
                            <MenuItem value={"dijkstra"}>Dijkstra&apos;s Algorithm</MenuItem>
                            <MenuItem value={"bidirectional"}>Bidirectional Search</MenuItem>
                        </Select>
                    </FormControl>

                    <div>
                        <Typography style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>Quick Jump</Typography>
                        <Button
                            id="locations-button"
                            aria-controls={menuOpen ? "locations-menu" : undefined}
                            aria-haspopup="true"
                            aria-expanded={menuOpen ? "true" : undefined}
                            onClick={(e) => {setMenuAnchor(e.currentTarget);}}
                            variant="contained"
                            disableElevation
                            className="btn-secondary"
                            style={{ width: "100%", justifyContent: "flex-start", padding: "12px 20px" }}
                            startIcon={<MapIcon />}
                        >
                            Explore Global Cities
                        </Button>
                        <Menu
                            id="locations-menu"
                            anchorEl={menuAnchor}
                            open={menuOpen}
                            onClose={() => {setMenuAnchor(null);}}
                            MenuListProps={{
                                "aria-labelledby": "locations-button",
                                sx: { backgroundColor: "#1e2028" }
                            }}
                            anchorOrigin={{
                                vertical: "bottom",
                                horizontal: "left",
                            }}
                            transformOrigin={{
                                vertical: "top",
                                horizontal: "left",
                            }}
                        >
                            {LOCATIONS.map(location => 
                                <MenuItem key={location.name} onClick={() => {
                                    closeMenu();
                                    changeLocation(location);
                                }}>{location.name}</MenuItem>
                            )}
                        </Menu>
                    </div>

                    <div className="side slider-container" style={{ marginTop: 10 }}>
                        <Typography id="area-slider" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 8 }}>
                            Search Radius
                        </Typography>
                        <Typography style={{ fontSize: 13, marginTop: -4, marginBottom: 8, color: "#00d2ff" }}>
                            {settings.radius}km ({(settings.radius / 1.609).toFixed(1)}mi)
                        </Typography>
                        <Slider disabled={started && !animationEnded} min={2} max={20} step={1} value={settings.radius} onChangeCommitted={() => { changeRadius(settings.radius); }} onChange={e => { setSettings({...settings, radius: Number(e.target.value)}); }} className="slider" aria-labelledby="area-slider" style={{ marginBottom: 1, color: "#00d2ff" }} 
                            marks={[
                                { value: 2, label: "2km" },
                                { value: 20, label: "20km" }
                            ]} 
                        />
                    </div>

                    <div className="side slider-container">
                        <Typography id="speed-slider" style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 10 }}>
                            Simulation Speed
                        </Typography>
                        <Slider min={1} max={30} value={settings.speed} onChange={e => { setSettings({...settings, speed: Number(e.target.value)}); }} className="slider" aria-labelledby="speed-slider" style={{ marginBottom: 1, color: "#7b61ff" }} />
                    </div>

                    <div className="styles-container">
                        <Typography style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 4 }} >
                            Visual Styles
                        </Typography>
                        
                        <div>
                            <Typography id="start-fill-label" fontSize="13px" style={{opacity: 0.8}}>Start Node Fill</Typography>
                            <div className="color-container">
                                <MuiColorInput format="rgb" value={arrayToRgb(colors.startNodeFill)} onChange={v => {setColors({...colors, startNodeFill: rgbToArray(v)});}} aria-labelledby="start-fill-label" size="small" />
                                <IconButton onClick={() => {setColors({...colors, startNodeFill: INITIAL_COLORS.startNodeFill});}} size="small">
                                    <Replay fontSize="small" style={{color: "rgba(255,255,255,0.6)"}} />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="start-border-label" fontSize="13px" style={{opacity: 0.8}}>Start Node Ring</Typography>
                            <div className="color-container">
                                <MuiColorInput format="rgb" value={arrayToRgb(colors.startNodeBorder)} onChange={v => {setColors({...colors, startNodeBorder: rgbToArray(v)});}} aria-labelledby="start-border-label" size="small" />
                                <IconButton onClick={() => {setColors({...colors, startNodeBorder: INITIAL_COLORS.startNodeBorder});}} size="small">
                                    <Replay fontSize="small" style={{color: "rgba(255,255,255,0.6)"}} />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="end-fill-label" fontSize="13px" style={{opacity: 0.8}}>End Node Fill</Typography>
                            <div className="color-container">
                                <MuiColorInput format="rgb" value={arrayToRgb(colors.endNodeFill)} onChange={v => {setColors({...colors, endNodeFill: rgbToArray(v)});}} aria-labelledby="end-fill-label" size="small" />
                                <IconButton onClick={() => {setColors({...colors, endNodeFill: INITIAL_COLORS.endNodeFill});}} size="small">
                                    <Replay fontSize="small" style={{color: "rgba(255,255,255,0.6)"}} />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="end-border-label" fontSize="13px" style={{opacity: 0.8}}>End Node Ring</Typography>
                            <div className="color-container">
                                <MuiColorInput format="rgb" value={arrayToRgb(colors.endNodeBorder)} onChange={v => {setColors({...colors, endNodeBorder: rgbToArray(v)});}} aria-labelledby="end-border-label" size="small" />
                                <IconButton onClick={() => {setColors({...colors, endNodeBorder: INITIAL_COLORS.endNodeBorder});}} size="small">
                                    <Replay fontSize="small" style={{color: "rgba(255,255,255,0.6)"}} />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="path-label" fontSize="13px" style={{opacity: 0.8}}>Visited Nodes Path</Typography>
                            <div className="color-container">
                                <MuiColorInput format="rgb" value={arrayToRgb(colors.path)} onChange={v => {setColors({...colors, path: rgbToArray(v)});}} aria-labelledby="path-label" size="small" />
                                <IconButton onClick={() => {setColors({...colors, path: INITIAL_COLORS.path});}} size="small">
                                    <Replay fontSize="small" style={{color: "rgba(255,255,255,0.6)"}} />
                                </IconButton>
                            </div>
                        </div>

                        <div>
                            <Typography id="route-label" fontSize="13px" style={{opacity: 0.8}}>Shortest Path Discovered</Typography>
                            <div className="color-container">
                                <MuiColorInput format="rgb" value={arrayToRgb(colors.route)} onChange={v => {setColors({...colors, route: rgbToArray(v)});}} aria-labelledby="route-label" size="small" />
                                <IconButton onClick={() => {setColors({...colors, route: INITIAL_COLORS.route});}} size="small">
                                    <Replay fontSize="small" style={{color: "rgba(255,255,255,0.6)"}} />
                                </IconButton>
                            </div>
                        </div>
                    </div>

                    <div className="shortcuts-container" style={{ marginTop: "auto", paddingTop: 20 }}>
                        <Typography style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, textTransform: "uppercase", fontWeight: 600, letterSpacing: 1, marginBottom: 8 }} >
                            Hotkeys
                        </Typography>

                        <div className="shortcut">
                            <p>SPACE</p>
                            <p>Play / Pause</p>
                        </div>
                        <div className="shortcut">
                            <p>R</p>
                            <p>Clear Map</p>
                        </div>
                        <div className="shortcut">
                            <p>Arrows</p>
                            <p>Timeline scrubbing</p>
                        </div>
                        
                        <Button onClick={() => {setActiveStep(0);setShowTutorial(true);}}
                            variant="outlined" className="btn-secondary" style={{ marginTop: 16 }}
                        >
                            Replay Tutorial
                        </Button>
                    </div>
                </div>
            </Drawer>
        </>
    );
});

Interface.displayName = "Interface";

export default Interface;
