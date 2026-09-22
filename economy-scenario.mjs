export function evaluateScenario({opening,firstReward,optionalCost,upgradeCost,replayReward,replayAvailable}) {
  for(const value of [opening,firstReward,optionalCost,upgradeCost,replayReward])if(!Number.isSafeInteger(value)||value<0||value>1_000_000)throw new Error('Use whole numbers between 0 and 1,000,000.');
  const earned=opening+firstReward;
  if(optionalCost>earned)return {status:'invalid_purchase',earned,balance:earned,replays:null,closing:null};
  const balance=earned-optionalCost,deficit=Math.max(0,upgradeCost-balance);
  if(!deficit)return {status:'affordable',earned,balance,deficit,replays:0,closing:balance-upgradeCost};
  if(!replayAvailable||!replayReward)return {status:'blocked',earned,balance,deficit,replays:null,closing:null};
  const replays=Math.ceil(deficit/replayReward);
  return {status:'recovery',earned,balance,deficit,replays,closing:balance+replays*replayReward-upgradeCost};
}
