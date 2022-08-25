export const	NOP = 0                // 0x00 // NOP                                         - 
export const	JMP = 1                // 0x01 // JMP           addr                          cmdAddr = addr
export const	CTOMI1 = 2             // 0x02 // CTOMI1        value                         mi1 = value
export const	CTOMI2 = 3             // 0x03 // CTOMI2        value                         mi2 = value
export const	MOSUMTOMI1 = 4         // 0x04 // MOSUMTOMI1                                  mi1 = mi1 + mi2
export const	MOSUBTOMI1 = 5         // 0x05 // MOSUBTOMI1                                  mi1 = mi1 - mi2
export const	CTOMEM = 6             // 0x06 // CTOMEM        addr             value        mem [addr] = value       addr is const in progmem, value is const number
export const	MEMTOMI1 = 7           // 0x07 // MEMTOMI1      addr                          mi1 = mem [addr]         addr is const in progmem
export const	MI1TOMEM = 8           // 0x08 // MI1TOMEM      addr                          mem [addr] = mi1         addr is const in progmem
export const	MEMTOMI2 = 9           // 0x09 // MEMTOMI2      addr                          mi2 = mem [addr]         addr is const in progmem
export const	MI2TOMEM = 10          // 0x0A // MI2TOMEM      addr                          mem [addr] = mi2         addr is const in progmem
export const	CTORA = 11             // 0x0B // CTROA         value                         ra = value
export const	INCRA = 12             // 0x0C // INCRA                                       ra = ra + 1
export const	DECRA = 13             // 0x0D // DECRA                                       ra = ra - 1
export const	MEMRATOMI2 = 14        // 0x0E // MEMRATOMI2                                  mi2 = mem[ra]
export const	MI2TOMEMRA = 15        // 0x0F // MI2TOMEMRA                                  mem[ra] = mi2
export const	MI2TORA = 16           // 0x10 // MI2TORA                                     ra = mi2
export const	RATOMI2 = 17           // 0x11 // RATOMI2                                     mi2 = ra
export const	SWPMI = 18             // 0x12 // SWMPI                                       mi1 = mi2, mi2 = mi1
export const	MI1TORA = 19           // 0x13 // MI1TORA                                     ra = mi1
export const	MI1TOMEMRA = 20        // 0x14 // MI1TOMEMRA                                  mem[ra]=mi1
export const 	PUSHMI1 = 21	       // 0x15 // PUSHMI1          addr                       stack[addr].push(mi1)
export const 	PUSHMI2 = 22	       // 0x16 // PUSHMI2          addr                       stack[addr].push(mi2)
export const 	POPMI1 = 23	           // 0x17 // POPMI1           addr                       mi1 = stack[addr].pop()
export const 	POPMI2 = 24	           // 0x18 // POPMI2           addr                       mi2 = stack[addr].pop()                 
export const    PUSHMI1MI2 = 25        // 0x19 // PUSHMI1MI2                                  stack[mi2].push(mi1)
export const    POPMI1MI2 = 26         // 0x1a // PUSHMI1MI2                                  mi1 = stack[mi2].pop()
export const    CALL = 27              // 0x1b // CALL			   proc_addr                  stack[stack_addr].push(cmdAddr); cmdAddr = proc_addr
export const    RET = 28               // 0x1c // RET              stack_addr                 cmdAddr = stack[stack_addr].pop()
export const    PUSHADDR = 29          // 0x1d // PUSHADDR         stack_addr    offset       stack[stackAddr].push(cmdAddr+offset)
export const    SBACKTOMI2 = 30        // 0x1e // SBACKTOMI2       stack_addr    back_offset  mi2 = stack[stack.length-back_offset]
export const    MI2TOSBACK = 31        // 0x1f // SBACKTOMI2       stack_addr    back_offset  mi2 = stack[stack.length-back_offset]          
export const    MALLOC = 32            // 0x20 // MALLOC           stack_addr,   size         stack.length+=size
export const    MFREE = 33		       // 0x21 // MFREE            size					      stack.length-=size
export const    MEMTOSP = 34		   // 0x22 // MEMTOSP          addr                       sp = mem[addr]
export const    MEMSPOFFSETTOMI1 = 35  // 0x23 // MEMSPODDSETTOMI1 offset                     mi1 = mem[sp+offset]
export const    MEMSPOFFSETTOMI2 = 36  // 0x24 // MEMSPOFFSETTOMI2 offset                     mi2 = mem[sp+offset]
export const 	MI1TOMEMSPOFFSET = 37  // 0x25 // MI1TOMEMSPOFFSET offset                     mem[sp+offset] = mi1
export const 	MI2TOMEMSPOFFSET = 38  // 0x26 // MI2TOMEMSPOFFSET offset                     mem[sp+offset] = mi2
export const 	PUSHSP = 39            // 0x27 // PUSHSP           stack_addr				  stack[stack_addr].pop(sp)
export const    POPSP = 40             // 0x28 // POPSP            stack_addr                 sp = stack[stack_addr].pop()
export const    MI2TOMEMSPNEGOFFSET = 41 // 0x29 // MI2TOMEMSPNEGOFFSET offset
export const    MEMSPNEGOFFSETTOMI2 = 42 // 0x30 // MEMSPNEGOFFSETTOMI2 offset
export const    MI1TOMEMSPNEGOFFSET = 43 // 0x31 // MI2TOMEMSPNEGOFFSET offset
export const    MEMSPNEGOFFSETTOMI1 = 44 // 0x32 // MEMSPNEGOFFSETTOMI2 offset
export const    PATOMI1             = 45 // 0x33 // PATOMI1 offset                            mi1 = sp - offset
export const 	MEMBYPATOMI1        = 46 // 0x34
export const 	MI1TOMEMBYPA        = 47 // 0x35
export const    MOMULTOMI1          = 78 // 0x36
// misc
export const    PRINT               = 199 // 0xC7
export const    PRINTC              = 200 // 0xC8
export const    READS               = 201 // OxC9

	export const	commands = {
		NOP, JMP, CTOMI1, CTOMI2, MOSUMTOMI1, MOSUBTOMI1, CTOMEM, MEMTOMI1, MI1TOMEM, MEMTOMI2, MI2TOMEM, CTORA, INCRA, DECRA, MEMRATOMI2, MI2TOMEMRA, MI2TORA, RATOMI2, SWPMI, MI1TORA, MI1TOMEMRA, PUSHMI1, PUSHMI2, POPMI1, POPMI2, PUSHMI1MI2, POPMI1MI2, 
		CALL, RET, PUSHADDR, SBACKTOMI2, MI2TOSBACK, MOMULTOMI1,
		MALLOC, MFREE,
		// SP COMMANDS
		MEMTOSP, MEMSPOFFSETTOMI1, MEMSPOFFSETTOMI2, MI1TOMEMSPOFFSET, MI2TOMEMSPOFFSET, PUSHSP, POPSP, MI2TOMEMSPNEGOFFSET, MEMSPNEGOFFSETTOMI2, MI1TOMEMSPNEGOFFSET, MEMSPNEGOFFSETTOMI1, 
		PATOMI1, MEMBYPATOMI1, MI1TOMEMBYPA,
		// MISC
		PRINT, PRINTC, READS

	}

	export const	commandArgs = {
		NOP:0, JMP:1, CTOMI1:1, CTOMI2:1, MOSUMTOMI1:0, MOSUBTOMI1:0, CTOMEM:2, MEMTOMI1:1, MI1TOMEM:1, MEMTOMI2:1, MI2TOMEM:1, CTORA:1, INCRA:0, DECRA:0, MEMRATOMI2:0, MI2TOMEMRA:0, 
		MI2TORA:0, RATOMI2:0, SWPMI:0, MI1TORA:0, MI1TOMEMRA:0, PUSHMI1:1, PUSHMI2:1, POPMI1:1, POPMI2:1, PUSHMI1MI2:0, POPMI1MI2:0, CALL: 1, RET:1, PUSHADDR: 2, SBACKTOMI2:2, MI2TOSBACK: 2, MOMULTOMI1:0,
		MALLOC: 2, MFREE: 2,
		MEMTOSP: 1, MEMSPOFFSETTOMI1: 1, MEMSPOFFSETTOMI2: 1, MI1TOMEMSPOFFSET: 1, MI2TOMEMSPOFFSET: 1, PUSHSP: 1, POPSP: 1, MI2TOMEMSPNEGOFFSET: 1, MEMSPNEGOFFSETTOMI2: 1, MI1TOMEMSPNEGOFFSET:1, MEMSPNEGOFFSETTOMI1: 1, 
		PATOMI1: 1, MEMBYPATOMI1: 1, MI1TOMEMBYPA: 1,
		PRINT: 0, PRINTC: 0, READS: 0
	}