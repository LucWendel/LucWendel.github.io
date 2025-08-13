// Basketball Stats App JavaScript

const PLAYER_NAMES = ["Wendel", "Lucas", "Nelis", "Cris", "Valentijn", "Gerard", "Stef", "Justin", "Tycho", "Coach"];

let players = PLAYER_NAMES.map((name, index) => ({
    id: index,
    name: name,
    number: null,
    onCourt: false, // Everyone starts on bench now
    stats: {
        twoPointMade: 0,
        twoPointAttempted: 0,
        threePointMade: 0,
        threePointAttempted: 0,
        freeThrowMade: 0,
        freeThrowAttempted: 0,
        defensiveRebounds: 0,
        offensiveRebounds: 0,
        assists: 0,
        steals: 0,
        blocks: 0,
        turnovers: 0
    }
}));

let currentAssistContext = null;
let currentReboundPlayerId = null;
let switchingPlayerId = null;
let currentGameStartTime = null;
let gameHistory = [];
let substitutes = []; // Array voor invallers
let editingPlayerId = null; // Voor edit functionaliteit

// Track last shot action per player to handle correct undo
let lastShotActions = {};

// Track all actions for global undo functionality
let actionHistory = [];

// Add substitute player
function addSubstitute() {
    const nameInput = document.getElementById('substituteName');
    const numberInput = document.getElementById('substituteNumber');
    const name = nameInput.value.trim();
    const number = numberInput.value;
    
    if (!name) {
        alert('Voer een naam in voor de invaller');
        return;
    }
    
    // Check if name already exists
    const allPlayers = [...players, ...substitutes];
    if (allPlayers.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        alert('Deze naam bestaat al');
        return;
    }
    
    // Check if number already exists (if provided)
    if (number && allPlayers.some(p => p.number === parseInt(number))) {
        alert('Dit rugnummer is al in gebruik');
        return;
    }
    
    const substitute = {
        id: players.length + substitutes.length,
        name: name,
        number: number ? parseInt(number) : null,
        onCourt: false, // Substitutes also start on bench
        isSubstitute: true,
        stats: {
            twoPointMade: 0,
            twoPointAttempted: 0,
            threePointMade: 0,
            threePointAttempted: 0,
            freeThrowMade: 0,
            freeThrowAttempted: 0,
            defensiveRebounds: 0,
            offensiveRebounds: 0,
            assists: 0,
            steals: 0,
            blocks: 0,
            turnovers: 0
        }
    };
    
    substitutes.push(substitute);
    nameInput.value = '';
    numberInput.value = '';
    renderSubstitutes();
}

// Remove substitute
function removeSubstitute(index) {
    if (confirm(`Weet je zeker dat je ${substitutes[index].name} wilt verwijderen?`)) {
        substitutes.splice(index, 1);
        renderSubstitutes();
    }
}

// Render substitutes list
function renderSubstitutes() {
    const container = document.getElementById('substitutesList');
    if (substitutes.length === 0) {
        container.innerHTML = '<p style="color: #666; font-style: italic; text-align: center; padding: 20px;">Nog geen invallers toegevoegd</p>';
        return;
    }
    
    container.innerHTML = `
        <div style="margin-bottom: 12px; font-weight: bold; color: #ff6600;">Toegevoegde Invallers:</div>
        <div style="display: grid; gap: 8px;">
            ${substitutes.map((sub, index) => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f8f9fa; border-radius: 8px; border: 1px solid #e9ecef;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="font-weight: 500;">${sub.name}</span>
                        ${sub.number ? `<span style="background: #ff6600; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">#${sub.number}</span>` : ''}
                    </div>
                    <button class="btn btn-secondary btn-small" onclick="removeSubstitute(${index})" style="background: #dc3545; color: white; border: none;">Verwijder</button>
                </div>
            `).join('')}
        </div>
    `;
}

// Get all players (original + substitutes)
function getAllPlayers() {
    return [...players, ...substitutes];
}

// Load saved data from localStorage
function loadGameHistory() {
    const saved = localStorage.getItem('basketballGameHistory');
    if (saved) {
        gameHistory = JSON.parse(saved);
    }
}

// Save game history to localStorage
function saveGameHistory() {
    localStorage.setItem('basketballGameHistory', JSON.stringify(gameHistory));
}

// Calculate total points for a player
function calculatePlayerPoints(stats) {
    return (stats.twoPointMade * 2) + (stats.threePointMade * 3) + stats.freeThrowMade;
}

// Calculate team total points
function calculateTeamPoints() {
    const allPlayers = getAllPlayers();
    return allPlayers.reduce((total, player) => total + calculatePlayerPoints(player.stats), 0);
}

// Track shot actions for correct undo functionality
function trackShotAction(playerId, shotType, wasMade) {
    if (!lastShotActions[playerId]) {
        lastShotActions[playerId] = {};
    }
    lastShotActions[playerId][shotType] = wasMade;
}

// Add action to history for global undo
function addActionToHistory(action) {
    actionHistory.push({
        ...action,
        timestamp: Date.now()
    });
    
    // Keep only last 20 actions to prevent memory issues
    if (actionHistory.length > 20) {
        actionHistory.shift();
    }
}

// Undo last action globally
function undoLastAction() {
    if (actionHistory.length === 0) {
        alert('Geen acties om ongedaan te maken!');
        return;
    }
    
    const lastAction = actionHistory.pop();
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === lastAction.playerId);
    
    if (!player) return;
    
    // Reverse the action
    switch(lastAction.type) {
        case 'stat':
            player.stats[lastAction.statKey] = Math.max(0, player.stats[lastAction.statKey] - 1);
            break;
        case 'shot_made':
            player.stats[lastAction.shotType + 'Made'] = Math.max(0, player.stats[lastAction.shotType + 'Made'] - 1);
            player.stats[lastAction.shotType + 'Attempted'] = Math.max(0, player.stats[lastAction.shotType + 'Attempted'] - 1);
            break;
        case 'shot_missed':
            player.stats[lastAction.shotType + 'Attempted'] = Math.max(0, player.stats[lastAction.shotType + 'Attempted'] - 1);
            break;
        case 'rebound':
            const reboundKey = lastAction.reboundType === 'defensive' ? 'defensiveRebounds' : 'offensiveRebounds';
            player.stats[reboundKey] = Math.max(0, player.stats[reboundKey] - 1);
            break;
        case 'statsEdit':
            // Restore all original stats for edit actions
            player.stats = { ...lastAction.originalStats };
            break;
    }
    
    renderGameStats();
    renderSidebar();
    
    alert(`Actie ongedaan gemaakt: ${lastAction.playerName}`);
}

// Handle shot miss (only increment attempted)
function addShotMiss(playerId, shotType) {
    updateStat(playerId, shotType + 'Attempted', true);
    trackShotAction(playerId, shotType, false);
    
    // Add to action history
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    addActionToHistory({
        type: 'shot_missed',
        playerId: playerId,
        shotType: shotType,
        playerName: player.name
    });
}

// Undo last shot action correctly
function undoLastShot(playerId, shotType) {
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    if (!player) return;

    const lastAction = lastShotActions[playerId] && lastShotActions[playerId][shotType];
    
    if (lastAction === true) {
        // Last action was a made shot, remove both made and attempted
        if (player.stats[shotType + 'Made'] > 0) {
            updateStat(playerId, shotType + 'Made', false);
            updateStat(playerId, shotType + 'Attempted', false);
        }
    } else if (lastAction === false) {
        // Last action was a miss, only remove attempted
        if (player.stats[shotType + 'Attempted'] > 0) {
            updateStat(playerId, shotType + 'Attempted', false);
        }
    } else {
        // No tracked action, default to removing made shot if available
        if (player.stats[shotType + 'Made'] > 0) {
            updateStat(playerId, shotType + 'Made', false);
            updateStat(playerId, shotType + 'Attempted', false);
        } else if (player.stats[shotType + 'Attempted'] > 0) {
            updateStat(playerId, shotType + 'Attempted', false);
        }
    }
    
    // Clear the tracked action after undo
    if (lastShotActions[playerId]) {
        delete lastShotActions[playerId][shotType];
    }
}

function updatePlayerNumber(playerId, value) {
    const player = players.find(p => p.id === playerId);
    if (player) {
        player.number = value === "" ? null : parseInt(value);
    }
}

function updateStat(playerId, statKey, increment) {
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    if (player) {
        const currentValue = player.stats[statKey];
        const newValue = Math.max(0, currentValue + (increment ? 1 : -1));
        
        // Only update if value actually changes and we're incrementing
        if (newValue !== currentValue && increment) {
            player.stats[statKey] = newValue;
            
            // Add to action history
            addActionToHistory({
                type: 'stat',
                playerId: playerId,
                statKey: statKey,
                playerName: player.name
            });
        } else if (!increment && currentValue > 0) {
            player.stats[statKey] = newValue;
        }
        
        renderGameStats();
        renderSidebar();
    }
}

function resetAllStats() {
    if (confirm('Weet je zeker dat je alle statistieken wilt resetten?')) {
        const allPlayers = getAllPlayers();
        allPlayers.forEach(player => {
            player.stats = {
                twoPointMade: 0,
                twoPointAttempted: 0,
                threePointMade: 0,
                threePointAttempted: 0,
                freeThrowMade: 0,
                freeThrowAttempted: 0,
                defensiveRebounds: 0,
                offensiveRebounds: 0,
                assists: 0,
                steals: 0,
                blocks: 0,
                turnovers: 0
            };
        });
        
        // Clear shot action tracking
        lastShotActions = {};
        
        renderGameStats();
        renderSidebar();
    }
}

function switchPlayer(playerId) {
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    const courtPlayers = allPlayers.filter(p => p.onCourt);
    const benchPlayers = allPlayers.filter(p => !p.onCourt);
    
    if (player.onCourt) {
        // Moving from court to bench - always show modal for consistency
        switchingPlayerId = playerId;
        showSwitchModal();
    } else {
        // Moving from bench to court
        if (courtPlayers.length < 5) {
            // Space available on court - allow direct move
            player.onCourt = true;
            renderSidebar();
            renderGameStats();
        } else {
            // Court is full, need to switch with someone
            switchingPlayerId = playerId;
            showSwitchModal();
        }
    }
}

function showSwitchModal() {
    const modal = document.getElementById('switchModal');
    const switchOptions = document.getElementById('switchOptions');
    const switchPlayerName = document.getElementById('switchPlayerName');
    
    const allPlayers = getAllPlayers();
    const switchingPlayer = allPlayers.find(p => p.id === switchingPlayerId);
    switchPlayerName.textContent = switchingPlayer.name;
    
    let availablePlayers;
    let modalOptions = '';
    
    if (switchingPlayer.onCourt) {
        // Player is on court, show bench players to switch with
        availablePlayers = allPlayers.filter(p => !p.onCourt);
        
        // Add switching options if there are bench players
        if (availablePlayers.length > 0) {
            modalOptions += availablePlayers.map(player => `
                <div class="modal-option" onclick="confirmSwitch(${player.id})">
                    <span style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                        <span>${player.name}</span>
                        ${player.number ? `<span style="background: #ff6600; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">#${player.number}</span>` : ''}
                        ${player.isSubstitute ? `<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">INVALLER</span>` : ''}
                    </span>
                </div>
            `).join('');
        }
    } else {
        // Player is on bench, show court players to switch with
        availablePlayers = allPlayers.filter(p => p.onCourt);
        modalOptions = availablePlayers.map(player => `
            <div class="modal-option" onclick="confirmSwitch(${player.id})">
                <span style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                    <span>${player.name}</span>
                    ${player.number ? `<span style="background: #ff6600; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">#${player.number}</span>` : ''}
                    ${player.isSubstitute ? `<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">INVALLER</span>` : ''}
                </span>
            </div>
        `).join('');
    }
    
    switchOptions.innerHTML = modalOptions;
    modal.classList.add('show');
}

function hideSwitchModal() {
    document.getElementById('switchModal').classList.remove('show');
    switchingPlayerId = null;
}

function confirmSwitch(selectedPlayerId) {
    if (switchingPlayerId !== null) {
        const allPlayers = getAllPlayers();
        const switchingPlayer = allPlayers.find(p => p.id === switchingPlayerId);
        const selectedPlayer = allPlayers.find(p => p.id === selectedPlayerId);
        
        // Switch the court/bench status
        const tempOnCourt = switchingPlayer.onCourt;
        switchingPlayer.onCourt = selectedPlayer.onCourt;
        selectedPlayer.onCourt = tempOnCourt;
        
        renderSidebar();
        renderGameStats();
    }
    hideSwitchModal();
}

function scoreWithAssist(playerId, statType) {
    currentAssistContext = { playerId, statType };
    showAssistModal();
}

function showAssistModal() {
    const modal = document.getElementById('assistModal');
    const assistOptions = document.getElementById('assistOptions');
    
    // Get only players on court (excluding the scorer)
    const allPlayers = getAllPlayers();
    const courtPlayers = allPlayers.filter(p => p.onCourt && p.id !== currentAssistContext.playerId);
    
    assistOptions.innerHTML = courtPlayers.map(player => `
        <div class="modal-option" onclick="confirmAssist(${player.id})">
            <span style="display: flex; align-items: center; gap: 8px; justify-content: center;">
                <span>${player.name}</span>
                ${player.number ? `<span style="background: #ff6600; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">#${player.number}</span>` : ''}
                ${player.isSubstitute ? `<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">INVALLER</span>` : ''}
            </span>
        </div>
    `).join('');
    
    modal.classList.add('show');
}

function hideAssistModal() {
    document.getElementById('assistModal').classList.remove('show');
    currentAssistContext = null;
}

function confirmAssist(assistPlayerId) {
    const { playerId, statType } = currentAssistContext;
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    
    // Update the scorer's stats
    updateStat(playerId, statType + 'Made', true);
    updateStat(playerId, statType + 'Attempted', true);
    
    // Track that this was a made shot
    trackShotAction(playerId, statType, true);
    
    // Add shot made to action history
    addActionToHistory({
        type: 'shot_made',
        playerId: playerId,
        shotType: statType,
        playerName: player.name
    });
    
    // Update the assist
    if (assistPlayerId !== null) {
        updateStat(assistPlayerId, 'assists', true);
    }
    
    hideAssistModal();
}

function confirmNoAssist() {
    const { playerId, statType } = currentAssistContext;
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    
    // Update only the scorer's stats
    updateStat(playerId, statType + 'Made', true);
    updateStat(playerId, statType + 'Attempted', true);
    
    // Track that this was a made shot
    trackShotAction(playerId, statType, true);
    
    // Add shot made to action history
    addActionToHistory({
        type: 'shot_made',
        playerId: playerId,
        shotType: statType,
        playerName: player.name
    });
    
    hideAssistModal();
}

function showReboundModal(playerId) {
    currentReboundPlayerId = playerId;
    document.getElementById('reboundModal').classList.add('show');
}

function hideReboundModal() {
    document.getElementById('reboundModal').classList.remove('show');
    currentReboundPlayerId = null;
}

function confirmRebound(type) {
    if (currentReboundPlayerId !== null) {
        const statKey = type === 'defensive' ? 'defensiveRebounds' : 'offensiveRebounds';
        updateStat(currentReboundPlayerId, statKey, true);
        
        // Add to action history
        const allPlayers = getAllPlayers();
        const player = allPlayers.find(p => p.id === currentReboundPlayerId);
        addActionToHistory({
            type: 'rebound',
            playerId: currentReboundPlayerId,
            reboundType: type,
            playerName: player.name
        });
    }
    hideReboundModal();
}

function decreaseRebound(playerId) {
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    if (player) {
        // Decrease defensive first, then offensive if defensive is 0
        if (player.stats.defensiveRebounds > 0) {
            updateStat(playerId, 'defensiveRebounds', false);
        } else if (player.stats.offensiveRebounds > 0) {
            updateStat(playerId, 'offensiveRebounds', false);
        }
    }
}

function startGame() {
    currentGameStartTime = new Date().toISOString();
    lastShotActions = {}; // Reset shot tracking for new game
    document.getElementById('setupPhase').classList.add('hidden');
    document.getElementById('gamePhase').classList.remove('hidden');
    renderGameStats();
    renderSidebar();
}

function goToSetup() {
    document.getElementById('gamePhase').classList.add('hidden');
    document.getElementById('setupPhase').classList.remove('hidden');
}

function renderSetup() {
    const container = document.getElementById('playerSetup');
    container.innerHTML = players.map(player => `
        <div class="player-setup">
            <div class="player-name">${player.name}</div>
            <div class="number-input-container">
                <span class="number-label">#</span>
                <input 
                    type="number" 
                    class="number-input"
                    min="0" 
                    max="99" 
                    value="${player.number || ''}"
                    placeholder="##"
                    onchange="updatePlayerNumber(${player.id}, this.value)"
                />
            </div>
        </div>
    `).join('');
}

function createStatButton(value, onIncrement, onDecrement, label, showRatio = false, attempted = 0) {
    return `
        <div class="stat-button">
            <div class="stat-label">${label}</div>
            <div class="stat-value">${showRatio ? `${value}/${attempted}` : value}</div>
            <div class="stat-controls">
                <button class="btn btn-secondary btn-icon" onclick="${onDecrement}">−</button>
                <button class="btn btn-icon" onclick="${onIncrement}">+</button>
            </div>
        </div>
    `;
}

function renderGameStats() {
    const container = document.getElementById('gameStats');
    const allPlayers = getAllPlayers();
    const courtPlayers = allPlayers.filter(p => p.onCourt);
    
    if (courtPlayers.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666; background: white; border-radius: 16px; border: 2px dashed #f0f0f0;">
                <h3 style="color: #ff6600; margin-bottom: 16px;">Nog geen spelers op het veld</h3>
                <p>Selecteer spelers in de sidebar om ze naar het veld te brengen</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = courtPlayers.map(player => `
        <div class="player-card">
            <div class="player-card-header">
                <div class="player-card-name">
                    ${player.name}
                    ${player.isSubstitute ? ` <span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; margin-left: 8px;">INVALLER</span>` : ''}
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${player.number ? `<div class="player-number">#${player.number}</div>` : ''}
                    <button class="edit-btn" onclick="showEditStatsModal(${player.id})">Edit</button>
                </div>
            </div>
            
             <!-- Schot Statistieken -->
            <div class="stat-group">
                ${createStatButton(
                    player.stats.twoPointMade,
                    `scoreWithAssist(${player.id}, 'twoPoint')`,
                    `undoLastShot(${player.id}, 'twoPoint')`,
                    '2PT',
                    true,
                    player.stats.twoPointAttempted
                )}
                ${createStatButton(
                    player.stats.threePointMade,
                    `scoreWithAssist(${player.id}, 'threePoint')`,
                    `undoLastShot(${player.id}, 'threePoint')`,
                    '3PT',
                    true,
                    player.stats.threePointAttempted
                )}
                ${createStatButton(
                    player.stats.freeThrowMade,
                    `updateStat(${player.id}, 'freeThrowMade', true); updateStat(${player.id}, 'freeThrowAttempted', true); trackShotAction(${player.id}, 'freeThrow', true);`,
                    `undoLastShot(${player.id}, 'freeThrow')`,
                    'FT',
                    true,
                    player.stats.freeThrowAttempted
                )}
            </div>

            <!-- Misser Knoppen -->
            <div class="miss-buttons">
                <button class="miss-btn" onclick="addShotMiss(${player.id}, 'twoPoint')">2PT Mis</button>
                <button class="miss-btn" onclick="addShotMiss(${player.id}, 'threePoint')">3PT Mis</button>
                <button class="miss-btn" onclick="addShotMiss(${player.id}, 'freeThrow')">FT Mis</button>
            </div>

            <!-- Rebound Statistieken -->
            <div class="stat-group">
                <div class="stat-button">
                    <div class="stat-label">REBOUNDS</div>
                    <div class="stat-value">[${player.stats.defensiveRebounds} - ${player.stats.offensiveRebounds}]</div>
                    <div class="stat-controls">
                        <button class="btn btn-secondary btn-icon" onclick="decreaseRebound(${player.id})">−</button>
                        <button class="btn btn-icon" onclick="showReboundModal(${player.id})">+</button>
                    </div>
                    <div class="rebound-display">DEF - OFF</div>
                </div>
                ${createStatButton(
                    player.stats.assists,
                    `updateStat(${player.id}, 'assists', true)`,
                    `updateStat(${player.id}, 'assists', false)`,
                    'ASS'
                )}
                ${createStatButton(
                    player.stats.steals,
                    `updateStat(${player.id}, 'steals', true)`,
                    `updateStat(${player.id}, 'steals', false)`,
                    'STL'
                )}
            </div>

            <!-- Overige Statistieken -->
            <div class="stat-group">
                ${createStatButton(
                    player.stats.blocks,
                    `updateStat(${player.id}, 'blocks', true)`,
                    `updateStat(${player.id}, 'blocks', false)`,
                    'BLK'
                )}
                ${createStatButton(
                    player.stats.turnovers,
                    `updateStat(${player.id}, 'turnovers', true)`,
                    `updateStat(${player.id}, 'turnovers', false)`,
                    'TOV'
                )}
                <div></div>
            </div>
        </div>
    `).join('');
}

function renderSidebar() {
    const container = document.getElementById('sidebarContent');
    const allPlayers = getAllPlayers();
    const courtPlayers = allPlayers.filter(p => p.onCourt);
    const benchPlayers = allPlayers.filter(p => !p.onCourt);
    
    container.innerHTML = `
        <div class="sidebar-section">
            <div class="sidebar-section-title court-indicator">Op het Veld (${courtPlayers.length}/5)</div>
            <div class="player-list court-players">
                ${courtPlayers.map(player => `
                    <div class="player-item">
                        <div class="player-info">
                            <span>${player.name}</span>
                            ${player.number ? `<span style="background: #ff6600; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">#${player.number}</span>` : ''}
                            ${player.isSubstitute ? `<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">INV</span>` : ''}
                        </div>
                        <button class="switch-btn" onclick="switchPlayer(${player.id})">Bank</button>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="sidebar-section">
            <div class="sidebar-section-title bench-indicator">Op de Bank (${benchPlayers.length})</div>
            <div class="player-list">
                ${benchPlayers.map(player => `
                    <div class="player-item">
                        <div class="player-info">
                            <span>${player.name}</span>
                            ${player.number ? `<span style="background: #ff6600; color: white; padding: 2px 6px; border-radius: 4px; font-size: 12px; font-weight: bold;">#${player.number}</span>` : ''}
                            ${player.isSubstitute ? `<span style="background: #28a745; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold;">INV</span>` : ''}
                        </div>
                        <button class="switch-btn" onclick="switchPlayer(${player.id})">Veld</button>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Save current game to history
function saveCurrentGame() {
    if (!currentGameStartTime) {
        alert('Start eerst een wedstrijd voordat je deze kunt opslaan!');
        return;
    }

    const teamScore = calculateTeamPoints();
    const allPlayers = getAllPlayers();
    const playersData = allPlayers.map(player => ({
        name: player.name,
        number: player.number,
        isSubstitute: player.isSubstitute || false,
        stats: { ...player.stats },
        points: calculatePlayerPoints(player.stats)
    }));

    const gameData = {
        id: Date.now(),
        date: currentGameStartTime,
        endDate: new Date().toISOString(),
        teamScore: teamScore,
        players: playersData
    };

    gameHistory.unshift(gameData); // Add to beginning of array
    saveGameHistory();
    
    alert(`Wedstrijd opgeslagen! Team score: ${teamScore} punten`);
}

// Show game history modal
function showGameHistory() {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyContent');
    
    if (gameHistory.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nog geen wedstrijden gespeeld!</p>';
    } else {
        content.innerHTML = gameHistory.map(game => {
            const date = new Date(game.date).toLocaleDateString('nl-NL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            const time = new Date(game.date).toLocaleTimeString('nl-NL', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const topScorer = game.players.reduce((top, player) => 
                player.points > top.points ? player : top, game.players[0]);

            // Calculate team totals
            const teamTotals = game.players.reduce((totals, player) => {
                totals.points += player.points;
                totals.assists += player.stats.assists;
                totals.rebounds += player.stats.defensiveRebounds + player.stats.offensiveRebounds;
                totals.steals += player.stats.steals;
                totals.blocks += player.stats.blocks;
                totals.turnovers += player.stats.turnovers;
                totals.twoPointMade += player.stats.twoPointMade;
                totals.twoPointAttempted += player.stats.twoPointAttempted;
                totals.threePointMade += player.stats.threePointMade;
                totals.threePointAttempted += player.stats.threePointAttempted;
                totals.freeThrowMade += player.stats.freeThrowMade;
                totals.freeThrowAttempted += player.stats.freeThrowAttempted;
                return totals;
            }, {
                points: 0, assists: 0, rebounds: 0, steals: 0, blocks: 0, turnovers: 0,
                twoPointMade: 0, twoPointAttempted: 0, threePointMade: 0, threePointAttempted: 0,
                freeThrowMade: 0, freeThrowAttempted: 0
            });

            const twoPointPct = teamTotals.twoPointAttempted > 0 ? 
                ((teamTotals.twoPointMade / teamTotals.twoPointAttempted) * 100).toFixed(1) : '0';
            const threePointPct = teamTotals.threePointAttempted > 0 ? 
                ((teamTotals.threePointMade / teamTotals.threePointAttempted) * 100).toFixed(1) : '0';
            const freeThrowPct = teamTotals.freeThrowAttempted > 0 ? 
                ((teamTotals.freeThrowMade / teamTotals.freeThrowAttempted) * 100).toFixed(1) : '0';

            return `
                <div class="history-item">
                    <div class="history-header">
                        <div class="history-date">${date} om ${time}</div>
                        <div class="history-score">Team Score: ${game.teamScore}</div>
                    </div>
                    
                    <div style="margin-bottom: 16px; padding: 12px; background: #f8f9fa; border-radius: 8px;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; font-size: 14px;">
                            <div><strong>Top Scorer:</strong> ${topScorer.name} (${topScorer.points} pts)</div>
                            <div><strong>Team Assists:</strong> ${teamTotals.assists}</div>
                            <div><strong>Team Rebounds:</strong> ${teamTotals.rebounds}</div>
                            <div><strong>Team Steals:</strong> ${teamTotals.steals}</div>
                            <div><strong>Team Blocks:</strong> ${teamTotals.blocks}</div>
                            <div><strong>Turnovers:</strong> ${teamTotals.turnovers}</div>
                        </div>
                        <div style="margin-top: 8px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 12px; font-size: 14px;">
                            <div><strong>2PT:</strong> ${teamTotals.twoPointMade}/${teamTotals.twoPointAttempted} (${twoPointPct}%)</div>
                            <div><strong>3PT:</strong> ${teamTotals.threePointMade}/${teamTotals.threePointAttempted} (${threePointPct}%)</div>
                            <div><strong>FT:</strong> ${teamTotals.freeThrowMade}/${teamTotals.freeThrowAttempted} (${freeThrowPct}%)</div>
                        </div>
                    </div>

                    <div class="history-players">
                        ${game.players.filter(p => calculatePlayerPoints(p.stats) > 0 || p.stats.assists > 0 || (p.stats.defensiveRebounds + p.stats.offensiveRebounds) > 0 || p.stats.steals > 0 || p.stats.blocks > 0 || p.stats.turnovers > 0).map(player => {
                            const playerTwoPointPct = player.stats.twoPointAttempted > 0 ? 
                                ((player.stats.twoPointMade / player.stats.twoPointAttempted) * 100).toFixed(0) : '0';
                            const playerThreePointPct = player.stats.threePointAttempted > 0 ? 
                                ((player.stats.threePointMade / player.stats.threePointAttempted) * 100).toFixed(0) : '0';
                            const playerFreeThrowPct = player.stats.freeThrowAttempted > 0 ? 
                                ((player.stats.freeThrowMade / player.stats.freeThrowAttempted) * 100).toFixed(0) : '0';
                            
                            return `
                                <div class="history-player">
                                    <div class="history-player-name">
                                        ${player.name} ${player.number ? `#${player.number}` : ''}
                                        ${player.isSubstitute ? ` <span style="background: #28a745; color: white; padding: 1px 4px; border-radius: 3px; font-size: 10px;">INV</span>` : ''}
                                    </div>
                                    <div class="history-player-stats">
                                        <div><strong>${player.points} punten</strong> | ${player.stats.assists} ast | ${player.stats.defensiveRebounds + player.stats.offensiveRebounds} reb</div>
                                        <div style="font-size: 11px; color: #888; margin-top: 4px;">
                                            2PT: ${player.stats.twoPointMade}/${player.stats.twoPointAttempted} (${playerTwoPointPct}%) | 
                                            3PT: ${player.stats.threePointMade}/${player.stats.threePointAttempted} (${playerThreePointPct}%) | 
                                            FT: ${player.stats.freeThrowMade}/${player.stats.freeThrowAttempted} (${playerFreeThrowPct}%)
                                        </div>
                                        ${player.stats.steals > 0 || player.stats.blocks > 0 || player.stats.turnovers > 0 ? 
                                            `<div style="font-size: 11px; color: #888;">STL: ${player.stats.steals} | BLK: ${player.stats.blocks} | TOV: ${player.stats.turnovers}</div>` : ''}
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    modal.classList.add('show');
}

// Hide game history modal
function hideHistoryModal() {
    document.getElementById('historyModal').classList.remove('show');
}

let currentSortColumn = 'totalPoints';
let currentSortDirection = 'desc';

// Show player statistics across all games
function showPlayerStats() {
    const modal = document.getElementById('playerStatsModal');
    const content = document.getElementById('playerStatsContent');
    
    if (gameHistory.length === 0) {
        content.innerHTML = '<p style="text-align: center; color: #666; padding: 40px;">Nog geen wedstrijden om statistieken te tonen!</p>';
    } else {
        // Only show these specific players
        const allowedPlayers = ['Wendel', 'Lucas', 'Nelis', 'Cris', 'Valentijn', 'Justin', 'Stef', 'Coach', 'Gerard'];
        
        // Calculate totals for each player across all games
        const playerTotals = {};
        
        // Initialize only allowed players
        allowedPlayers.forEach(name => {
            playerTotals[name] = {
                gamesPlayed: 0,
                totalPoints: 0,
                totalAssists: 0,
                totalRebounds: 0,
                totalSteals: 0,
                totalBlocks: 0,
                totalTurnovers: 0,
                twoPointMade: 0,
                twoPointAttempted: 0,
                threePointMade: 0,
                threePointAttempted: 0,
                freeThrowMade: 0,
                freeThrowAttempted: 0
            };
        });

        gameHistory.forEach(game => {
            game.players.forEach(player => {
                // Only process allowed players
                if (playerTotals[player.name]) {
                    const totals = playerTotals[player.name];
                    
                    // Count any participation as a game played
                    totals.gamesPlayed++;
                    totals.totalPoints += player.points || calculatePlayerPoints(player.stats);
                    totals.totalAssists += player.stats.assists;
                    totals.totalRebounds += (player.stats.defensiveRebounds || 0) + (player.stats.offensiveRebounds || 0);
                    totals.totalSteals += player.stats.steals;
                    totals.totalBlocks += player.stats.blocks;
                    totals.totalTurnovers += player.stats.turnovers;
                    totals.twoPointMade += player.stats.twoPointMade;
                    totals.twoPointAttempted += player.stats.twoPointAttempted;
                    totals.threePointMade += player.stats.threePointMade;
                    totals.threePointAttempted += player.stats.threePointAttempted;
                    totals.freeThrowMade += player.stats.freeThrowMade;
                    totals.freeThrowAttempted += player.stats.freeThrowAttempted;
                }
            });
        });

        // Get only allowed players
        const allPlayers = Object.entries(playerTotals);

        renderPlayerStatsTable(allPlayers, content);
    }
    
    modal.classList.add('show');
}

function renderPlayerStatsTable(players, content) {
    // Sort players based on current sort column and direction
    const sortedPlayers = [...players].sort((a, b) => {
        const [nameA, statsA] = a;
        const [nameB, statsB] = b;
        
        let valueA, valueB;
        
        switch(currentSortColumn) {
            case 'name':
                valueA = nameA;
                valueB = nameB;
                break;
            case 'gamesPlayed':
                valueA = statsA.gamesPlayed;
                valueB = statsB.gamesPlayed;
                break;
            case 'totalPoints':
                valueA = statsA.totalPoints;
                valueB = statsB.totalPoints;
                break;
            case 'avgPoints':
                valueA = statsA.gamesPlayed > 0 ? statsA.totalPoints / statsA.gamesPlayed : 0;
                valueB = statsB.gamesPlayed > 0 ? statsB.totalPoints / statsB.gamesPlayed : 0;
                break;
            case 'totalAssists':
                valueA = statsA.totalAssists;
                valueB = statsB.totalAssists;
                break;
            case 'totalRebounds':
                valueA = statsA.totalRebounds;
                valueB = statsB.totalRebounds;
                break;
            case 'totalSteals':
                valueA = statsA.totalSteals;
                valueB = statsB.totalSteals;
                break;
            case 'totalBlocks':
                valueA = statsA.totalBlocks;
                valueB = statsB.totalBlocks;
                break;
            case 'totalTurnovers':
                valueA = statsA.totalTurnovers;
                valueB = statsB.totalTurnovers;
                break;
            case 'twoPointPct':
                valueA = statsA.twoPointAttempted > 0 ? (statsA.twoPointMade / statsA.twoPointAttempted) : -1;
                valueB = statsB.twoPointAttempted > 0 ? (statsB.twoPointMade / statsB.twoPointAttempted) : -1;
                break;
            case 'threePointPct':
                valueA = statsA.threePointAttempted > 0 ? (statsA.threePointMade / statsA.threePointAttempted) : -1;
                valueB = statsB.threePointAttempted > 0 ? (statsB.threePointMade / statsB.threePointAttempted) : -1;
                break;
            case 'freeThrowPct':
                valueA = statsA.freeThrowAttempted > 0 ? (statsA.freeThrowMade / statsA.freeThrowAttempted) : -1;
                valueB = statsB.freeThrowAttempted > 0 ? (statsB.freeThrowMade / statsB.freeThrowAttempted) : -1;
                break;
            default:
                valueA = statsA.totalPoints;
                valueB = statsB.totalPoints;
        }
        
        if (currentSortDirection === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });

    const getSortIcon = (column) => {
        if (currentSortColumn === column) {
            return currentSortDirection === 'asc' ? ' ↑' : ' ↓';
        }
        return ' ↕';
    };

    content.innerHTML = `
        <div style="margin-bottom: 16px; text-align: center; color: #666;">
            Klik op een kolomtitel om te sorteren
        </div>
        <div style="overflow-x: auto; -webkit-overflow-scrolling: touch;">
            <table class="stats-table sortable-table" style="min-width: 800px;">
                <thead>
                    <tr>
                        <th onclick="sortPlayerStats('name')" style="cursor: pointer; width: 120px;">Speler${getSortIcon('name')}</th>
                        <th onclick="sortPlayerStats('gamesPlayed')" style="cursor: pointer; width: 80px;">Wed.${getSortIcon('gamesPlayed')}</th>
                        <th onclick="sortPlayerStats('totalPoints')" style="cursor: pointer; width: 80px;">Punten${getSortIcon('totalPoints')}</th>
                        <th onclick="sortPlayerStats('avgPoints')" style="cursor: pointer; width: 80px;">Gem.${getSortIcon('avgPoints')}</th>
                        <th onclick="sortPlayerStats('totalAssists')" style="cursor: pointer; width: 60px;">AST${getSortIcon('totalAssists')}</th>
                        <th onclick="sortPlayerStats('totalRebounds')" style="cursor: pointer; width: 60px;">REB${getSortIcon('totalRebounds')}</th>
                        <th onclick="sortPlayerStats('totalSteals')" style="cursor: pointer; width: 60px;">STL${getSortIcon('totalSteals')}</th>
                        <th onclick="sortPlayerStats('totalBlocks')" style="cursor: pointer; width: 60px;">BLK${getSortIcon('totalBlocks')}</th>
                        <th onclick="sortPlayerStats('totalTurnovers')" style="cursor: pointer; width: 60px;">TOV${getSortIcon('totalTurnovers')}</th>
                        <th onclick="sortPlayerStats('twoPointPct')" style="cursor: pointer; width: 70px;">2PT%${getSortIcon('twoPointPct')}</th>
                        <th onclick="sortPlayerStats('threePointPct')" style="cursor: pointer; width: 70px;">3PT%${getSortIcon('threePointPct')}</th>
                        <th onclick="sortPlayerStats('freeThrowPct')" style="cursor: pointer; width: 70px;">FT%${getSortIcon('freeThrowPct')}</th>
                    </tr>
                </thead>
            <tbody>
                ${sortedPlayers.map(([name, stats]) => {
                    const avgPoints = stats.gamesPlayed > 0 ? (stats.totalPoints / stats.gamesPlayed).toFixed(1) : '0.0';
                    const twoPointPct = stats.twoPointAttempted > 0 ? 
                        ((stats.twoPointMade / stats.twoPointAttempted) * 100).toFixed(1) + '%' : '-';
                    const threePointPct = stats.threePointAttempted > 0 ? 
                        ((stats.threePointMade / stats.threePointAttempted) * 100).toFixed(1) + '%' : '-';
                    const freeThrowPct = stats.freeThrowAttempted > 0 ? 
                        ((stats.freeThrowMade / stats.freeThrowAttempted) * 100).toFixed(1) + '%' : '-';
                    
                    return `
                        <tr>
                            <td><strong>${name}</strong></td>
                            <td>${stats.gamesPlayed}</td>
                            <td><strong>${stats.totalPoints}</strong></td>
                            <td>${avgPoints}</td>
                            <td>${stats.totalAssists}</td>
                            <td>${stats.totalRebounds}</td>
                            <td>${stats.totalSteals}</td>
                            <td>${stats.totalBlocks}</td>
                            <td>${stats.totalTurnovers}</td>
                            <td>${twoPointPct}</td>
                            <td>${threePointPct}</td>
                            <td>${freeThrowPct}</td>
                        </tr>
                    `;
                }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// Function to sort player stats
function sortPlayerStats(column) {
    if (currentSortColumn === column) {
        currentSortDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        currentSortColumn = column;
        currentSortDirection = 'desc';
    }
    
    // Re-show the modal with new sorting
    showPlayerStats();
}

// Hide player stats modal
function hidePlayerStatsModal() {
    document.getElementById('playerStatsModal').classList.remove('show');
}

// Show edit stats modal
function showEditStatsModal(playerId) {
    editingPlayerId = playerId;
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === playerId);
    
    document.getElementById('editPlayerName').textContent = player.name;
    
    const form = document.getElementById('editStatsForm');
    form.innerHTML = `
        <div class="edit-form-group">
            <label class="edit-form-label">2-Punters Gemaakt:</label>
            <input type="number" class="edit-form-input" id="edit_twoPointMade" value="${player.stats.twoPointMade}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">2-Punters Geprobeerd:</label>
            <input type="number" class="edit-form-input" id="edit_twoPointAttempted" value="${player.stats.twoPointAttempted}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">3-Punters Gemaakt:</label>
            <input type="number" class="edit-form-input" id="edit_threePointMade" value="${player.stats.threePointMade}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">3-Punters Geprobeerd:</label>
            <input type="number" class="edit-form-input" id="edit_threePointAttempted" value="${player.stats.threePointAttempted}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Vrije Worpen Gemaakt:</label>
            <input type="number" class="edit-form-input" id="edit_freeThrowMade" value="${player.stats.freeThrowMade}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Vrije Worpen Geprobeerd:</label>
            <input type="number" class="edit-form-input" id="edit_freeThrowAttempted" value="${player.stats.freeThrowAttempted}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Defensieve Rebounds:</label>
            <input type="number" class="edit-form-input" id="edit_defensiveRebounds" value="${player.stats.defensiveRebounds}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Offensieve Rebounds:</label>
            <input type="number" class="edit-form-input" id="edit_offensiveRebounds" value="${player.stats.offensiveRebounds}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Assists:</label>
            <input type="number" class="edit-form-input" id="edit_assists" value="${player.stats.assists}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Steals:</label>
            <input type="number" class="edit-form-input" id="edit_steals" value="${player.stats.steals}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Blocks:</label>
            <input type="number" class="edit-form-input" id="edit_blocks" value="${player.stats.blocks}" min="0">
        </div>
        <div class="edit-form-group">
            <label class="edit-form-label">Turnovers:</label>
            <input type="number" class="edit-form-input" id="edit_turnovers" value="${player.stats.turnovers}" min="0">
        </div>
    `;
    
    document.getElementById('editStatsModal').classList.add('show');
}

// Hide edit stats modal
function hideEditStatsModal() {
    document.getElementById('editStatsModal').classList.remove('show');
    editingPlayerId = null;
}

// Save edited stats
function saveEditedStats() {
    if (editingPlayerId === null) return;
    
    const allPlayers = getAllPlayers();
    const player = allPlayers.find(p => p.id === editingPlayerId);
    
    // Store original stats for action tracking
    const originalStats = { ...player.stats };
    
    // Get values from form inputs
    let twoPointMade = parseInt(document.getElementById('edit_twoPointMade').value) || 0;
    let twoPointAttempted = parseInt(document.getElementById('edit_twoPointAttempted').value) || 0;
    let threePointMade = parseInt(document.getElementById('edit_threePointMade').value) || 0;
    let threePointAttempted = parseInt(document.getElementById('edit_threePointAttempted').value) || 0;
    let freeThrowMade = parseInt(document.getElementById('edit_freeThrowMade').value) || 0;
    let freeThrowAttempted = parseInt(document.getElementById('edit_freeThrowAttempted').value) || 0;
    
    // Validate and auto-correct shooting stats
    if (twoPointMade > twoPointAttempted) {
        twoPointAttempted = twoPointMade;
        document.getElementById('edit_twoPointAttempted').value = twoPointAttempted;
    }
    
    if (threePointMade > threePointAttempted) {
        threePointAttempted = threePointMade;
        document.getElementById('edit_threePointAttempted').value = threePointAttempted;
    }
    
    if (freeThrowMade > freeThrowAttempted) {
        freeThrowAttempted = freeThrowMade;
        document.getElementById('edit_freeThrowAttempted').value = freeThrowAttempted;
    }
    
    // Show warning if corrections were made
    const originalTwoAtt = parseInt(document.getElementById('edit_twoPointAttempted').dataset.original) || twoPointAttempted;
    const originalThreeAtt = parseInt(document.getElementById('edit_threePointAttempted').dataset.original) || threePointAttempted;
    const originalFreeAtt = parseInt(document.getElementById('edit_freeThrowAttempted').dataset.original) || freeThrowAttempted;
    
    if (twoPointMade > originalTwoAtt || threePointMade > originalThreeAtt || freeThrowMade > originalFreeAtt) {
        alert('Let op: Aantal pogingen is automatisch aangepast omdat je niet meer kunt scoren dan proberen!');
        return; // Let user see the corrections before saving
    }
    
    // Update all stats from form inputs
    player.stats.twoPointMade = twoPointMade;
    player.stats.twoPointAttempted = twoPointAttempted;
    player.stats.threePointMade = threePointMade;
    player.stats.threePointAttempted = threePointAttempted;
    player.stats.freeThrowMade = freeThrowMade;
    player.stats.freeThrowAttempted = freeThrowAttempted;
    player.stats.defensiveRebounds = parseInt(document.getElementById('edit_defensiveRebounds').value) || 0;
    player.stats.offensiveRebounds = parseInt(document.getElementById('edit_offensiveRebounds').value) || 0;
    player.stats.assists = parseInt(document.getElementById('edit_assists').value) || 0;
    player.stats.steals = parseInt(document.getElementById('edit_steals').value) || 0;
    player.stats.blocks = parseInt(document.getElementById('edit_blocks').value) || 0;
    player.stats.turnovers = parseInt(document.getElementById('edit_turnovers').value) || 0;
    
    // Add to action history
    addActionToHistory({
        type: 'statsEdit',
        playerId: editingPlayerId,
        playerName: player.name,
        originalStats: originalStats,
        newStats: { ...player.stats }
    });
    
    // Re-render everything
    renderGameStats();
    renderSidebar();
    
    hideEditStatsModal();
}

// Export game data as JSON
function exportGameData() {
    if (gameHistory.length === 0) {
        alert('Geen data om te exporteren!');
        return;
    }

    const exportData = {
        exportDate: new Date().toISOString(),
        totalGames: gameHistory.length,
        games: gameHistory
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `basketball-stats-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert('Data geëxporteerd! Check je Downloads folder.');
}

// Import game data from JSON file
function importGameData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const importedData = JSON.parse(e.target.result);
                
                // Validate imported data structure
                if (!importedData.games || !Array.isArray(importedData.games)) {
                    alert('Ongeldig bestand! Geen wedstrijd data gevonden.');
                    return;
                }
                
                // Ask user what to do with existing data
                const action = confirm(
                    `Import ${importedData.totalGames || importedData.games.length} wedstrijden?\n\n` +
                    `Klik "OK" om toe te voegen aan bestaande data\n` +
                    `Klik "Annuleren" om te vervangen`
                );
                
                if (action) {
                    // Add to existing data
                    gameHistory.push(...importedData.games);
                } else {
                    // Replace existing data
                    gameHistory = importedData.games;
                }
                
                saveGameHistory();
                alert(`Data geïmporteerd! ${importedData.games.length} wedstrijden geladen.`);
                
                // Refresh display if in history view
                if (!document.getElementById('historyModal').classList.contains('hidden')) {
                    showGameHistory();
                }
            } catch (error) {
                alert('Fout bij importeren: Ongeldig JSON bestand!');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

// Show database management interface
function showDatabaseManager() {
    const modal = document.getElementById('historyModal');
    const content = document.getElementById('historyContent');
    
    content.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <h4 style="margin-bottom: 20px;">Database Beheer</h4>
            
            <div style="display: grid; gap: 16px; max-width: 400px; margin: 0 auto;">
                <div style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 16px;">
                    <h5 style="margin-bottom: 12px;">📁 Lokale Data</h5>
                    <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                        ${gameHistory.length} wedstrijden opgeslagen
                    </p>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn btn-small" onclick="exportGameData()">Export</button>
                        <button class="btn btn-small" onclick="importGameData()">Import</button>
                    </div>
                </div>
                
                <div style="border: 2px solid #f0f0f0; border-radius: 8px; padding: 16px;">
                    <h5 style="margin-bottom: 12px;">☁️ Cloud Backup</h5>
                    <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                        Sync tussen devices via GitHub
                    </p>
                    <div style="display: flex; gap: 8px; justify-content: center;">
                        <button class="btn btn-small" onclick="uploadToGitHub()">Upload</button>
                        <button class="btn btn-small" onclick="downloadFromGitHub()">Download</button>
                    </div>
                </div>
                
                <div style="border: 2px solid #ffe6e6; border-radius: 8px; padding: 16px;">
                    <h5 style="margin-bottom: 12px; color: #d9534f;">⚠️ Reset Data</h5>
                    <p style="color: #666; font-size: 14px; margin-bottom: 16px;">
                        Verwijder alle opgeslagen wedstrijden
                    </p>
                    <button class="btn btn-small" onclick="clearAllData()" style="background: #d9534f; color: white;">Wis Alles</button>
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

// Clear all stored data
function clearAllData() {
    if (confirm('Weet je zeker dat je ALLE data wilt wissen? Dit kan niet ongedaan gemaakt worden!')) {
        gameHistory = [];
        saveGameHistory();
        localStorage.clear();
        alert('Alle data gewist!');
        showDatabaseManager();
    }
}

// GitHub integration for cloud storage
const GITHUB_CONFIG = {
    owner: 'LucWendel',
    repo: 'LucWendel.github.io',
    branch: 'master',
    dataPath: 'data/basketball-stats.json'
};

// Upload data to GitHub
async function uploadToGitHub() {
    try {
        const exportData = {
            exportDate: new Date().toISOString(),
            totalGames: gameHistory.length,
            games: gameHistory
        };
        
        const content = btoa(JSON.stringify(exportData, null, 2));
        
        // For now, create a downloadable file with GitHub upload instructions
        const instructions = `
# Basketball Stats Data Upload

## Stap 1: Download deze data
De data hieronder moet geupload worden naar je GitHub repository.

## Stap 2: Upload naar GitHub
1. Ga naar: https://github.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}
2. Maak een nieuwe folder aan: "data"
3. Upload een nieuw bestand: "basketball-stats.json"
4. Plak de onderstaande content erin

## Data:
\`\`\`json
${JSON.stringify(exportData, null, 2)}
\`\`\`

## Stap 3: Commit
Commit de changes naar je repository.
        `;
        
        const blob = new Blob([instructions], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'github-upload-instructions.md';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert('Upload instructies gedownload! Volg de stappen in het bestand.');
        
    } catch (error) {
        console.error('GitHub upload error:', error);
        alert('Fout bij uploaden naar GitHub. Check de console voor details.');
    }
}

// Download data from GitHub
async function downloadFromGitHub() {
    try {
        const url = `https://raw.githubusercontent.com/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/${GITHUB_CONFIG.branch}/${GITHUB_CONFIG.dataPath}`;
        
        const response = await fetch(url);
        
        if (!response.ok) {
            if (response.status === 404) {
                alert('Geen data gevonden op GitHub. Upload eerst data!');
                return;
            }
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const cloudData = await response.json();
        
        if (!cloudData.games || !Array.isArray(cloudData.games)) {
            alert('Ongeldige data structuur op GitHub!');
            return;
        }
        
        // Compare with local data
        const cloudDate = new Date(cloudData.exportDate);
        const localData = gameHistory.length;
        
        const action = confirm(
            `GitHub data gevonden!\n\n` +
            `Cloud: ${cloudData.totalGames} wedstrijden (${cloudDate.toLocaleDateString()})\n` +
            `Lokaal: ${localData} wedstrijden\n\n` +
            `Klik "OK" om cloud data te downloaden en lokale data te vervangen\n` +
            `Klik "Annuleren" om te stoppen`
        );
        
        if (action) {
            gameHistory = cloudData.games;
            saveGameHistory();
            alert(`Cloud data geladen! ${cloudData.totalGames} wedstrijden geïmporteerd.`);
            showDatabaseManager();
        }
        
    } catch (error) {
        console.error('GitHub download error:', error);
        alert('Fout bij downloaden van GitHub: ' + error.message);
    }
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('show');
            currentAssistContext = null;
            currentReboundPlayerId = null;
            switchingPlayerId = null;
            editingPlayerId = null;
        }
    });
});

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadGameHistory();
    renderSetup();
    renderSubstitutes();
    
    // Prevent zoom on iOS when focusing inputs
    document.addEventListener('touchstart', function(event) {
        if (event.touches.length > 1) {
            event.preventDefault();
        }
    });

    let lastTouchEnd = 0;
    document.addEventListener('touchend', function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
});
