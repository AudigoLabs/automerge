const { ROOT_ID, copyObject, parseOpId } = require('./common')
const { Encoder, Decoder, RLEEncoder, RLEDecoder, DeltaEncoder, DeltaDecoder, BooleanEncoder, BooleanDecoder } = require('./encoding')

// Maybe we should be using the platform's built-in hash implementation?
// Node has the crypto module: https://nodejs.org/api/crypto.html and browsers have
// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
// However, the WebCrypto API is asynchronous (returns promises), which would
// force all our APIs to become asynchronous as well, which would be annoying.
//
// I think on balance, it's safe enough to use a random library off npm:
// - We only need one hash function (not a full suite of crypto algorithms);
// - SHA256 is quite simple and has fairly few opportunities for subtle bugs
//   (compared to asymmetric cryptography anyway);
// - It does not need a secure source of random bits and does not need to be
//   constant-time;
// - I have reviewed the source code and it seems pretty reasonable.
const { Hash } = require('fast-sha256')

// These bytes don't mean anything, they were generated randomly
const MAGIC_BYTES = Uint8Array.of(0x85, 0x6f, 0x4a, 0x83)

const COLUMN_TYPE = {
  GROUP_CARD: 0, ACTOR_ID: 1, INT_RLE: 2, INT_DELTA: 3, BOOLEAN: 4,
  STRING_RLE: 5, VALUE_LEN: 6, VALUE_RAW: 7
}

const VALUE_TYPE = {
  NULL: 0, FALSE: 1, TRUE: 2, LEB128_UINT: 3, LEB128_INT: 4, IEEE754: 5,
  UTF8: 6, BYTES: 7, COUNTER: 8, TIMESTAMP: 9, MIN_UNKNOWN: 10, MAX_UNKNOWN: 15
}

const ACTIONS = ['set', 'del', 'inc', 'link', 'makeMap', 'makeList', 'makeText', 'makeTable']

const CHANGE_COLUMNS = {
  objActor:  0 << 3 | COLUMN_TYPE.ACTOR_ID,
  objCtr:    0 << 3 | COLUMN_TYPE.INT_RLE,
  keyActor:  1 << 3 | COLUMN_TYPE.ACTOR_ID,
  keyCtr:    1 << 3 | COLUMN_TYPE.INT_DELTA,
  keyStr:    1 << 3 | COLUMN_TYPE.STRING_RLE,
  idActor:   2 << 3 | COLUMN_TYPE.ACTOR_ID,
  idCtr:     2 << 3 | COLUMN_TYPE.INT_RLE,
  insert:    3 << 3 | COLUMN_TYPE.BOOLEAN,
  action:    4 << 3 | COLUMN_TYPE.INT_RLE,
  valLen:    5 << 3 | COLUMN_TYPE.VALUE_LEN,
  valRaw:    5 << 3 | COLUMN_TYPE.VALUE_RAW,
  chldActor: 6 << 3 | COLUMN_TYPE.ACTOR_ID,
  chldCtr:   6 << 3 | COLUMN_TYPE.INT_RLE,
  predNum:   7 << 3 | COLUMN_TYPE.GROUP_CARD,
  predActor: 7 << 3 | COLUMN_TYPE.ACTOR_ID,
  predCtr:   7 << 3 | COLUMN_TYPE.INT_RLE,
  succNum:   8 << 3 | COLUMN_TYPE.GROUP_CARD,
  succActor: 8 << 3 | COLUMN_TYPE.ACTOR_ID,
  succCtr:   8 << 3 | COLUMN_TYPE.INT_RLE
}

/**
 * Returns true if the two byte arrays contain the same data, false if not.
 */
function compareBytes(array1, array2) {
  if (array1.byteLength !== array2.byteLength) return false
  for (let i = 0; i < array1.byteLength; i++) {
    if (array1[i] !== array2[i]) return false
  }
  return true
}

/**
 * Parses a string of the form '12345@someActorId' into an object of the form
 * {counter: 12345, actorId: 'someActorId'}, and any other string into an object
 * of the form {value: 'originalString'}.
 */
function maybeParseOpId(value) {
  if (value === undefined) return {}
  // FIXME when parsing the "key" of an operation, need to correctly handle
  // map property names that happen to contain an @ sign
  return (value.indexOf('@') >= 0) ? parseOpId(value) : {value}
}

/**
 * Maps an opId of the form {counter: 12345, actorId: 'someActorId'} to the form
 * {counter: 12345, actorNum: 123}, where the actorNum is zero for the actor
 * `ownActor`, and the (1-based) index into the `actorIds` array otherwise.
 */
function actorIdToActorNum(opId, ownActor, actorIds) {
  if (!opId.actorId) return opId
  const counter = opId.counter
  if (opId.actorId === ownActor) return {counter, actorNum: 0}
  const actorNum = actorIds.indexOf(opId.actorId) + 1
  if (actorNum === 0) throw new RangeError('missing actorId') // should not happen
  return {counter, actorNum}
}

/**
 * Returns an object `{change, actorIds}` where `change` is a copy of the argument
 * in which all string opIds have been replaced with `{counter, actorNum}` objects,
 * and where `actorIds` is a lexicographically sorted array of actor IDs occurring
 * in any of the operations, excluding the actorId of the change itself. An
 * `actorNum` value of zero indicates the actorId is the author of the change
 * itself, and an `actorNum` greater than zero is an index into the array of
 * actorIds (indexed starting from 1).
 */
function parseAllOpIds(change) {
  const actors = {}
  change = copyObject(change)
  for (let actor of Object.keys(change.deps)) actors[actor] = true
  change.ops = change.ops.map(op => {
    op = copyObject(op)
    op.obj = maybeParseOpId(op.obj)
    op.key = maybeParseOpId(op.key)
    op.child = maybeParseOpId(op.child)
    if (op.pred) op.pred = op.pred.map(parseOpId)
    if (op.obj.actorId) actors[op.obj.actorId] = true
    if (op.key.actorId) actors[op.key.actorId] = true
    if (op.child.actorId) actors[op.child.actorId] = true
    for (let pred of op.pred) actors[pred.actorId] = true
    return op
  })
  const actorIds = Object.keys(actors).filter(actor => actor !== change.actor).sort()
  for (let op of change.ops) {
    op.obj = actorIdToActorNum(op.obj, change.actor, actorIds)
    op.key = actorIdToActorNum(op.key, change.actor, actorIds)
    op.pred = op.pred.map(pred => actorIdToActorNum(pred, change.actor, actorIds))
  }
  return {change, actorIds}
}

/**
 * Encodes the `obj` property of operation `op` into the two columns
 * `objActor` and `objCtr`.
 */
function encodeObjectId(op, columns) {
  if (op.obj.value === ROOT_ID) {
    columns.objActor.appendValue(null)
    columns.objCtr.appendValue(null)
  } else if (op.obj.actorNum >= 0 & op.obj.counter > 0) {
    columns.objActor.appendValue(op.obj.actorNum)
    columns.objCtr.appendValue(op.obj.counter)
  } else {
    throw new RangeError(`Unexpected objectId reference: ${JSON.stringify(op.obj)}`)
  }
}

/**
 * Encodes the `key` property of operation `op` into the three columns
 * `keyActor`, `keyCtr`, and `keyStr`.
 */
function encodeOperationKey(op, columns) {
  if (op.key.value === '_head' && op.insert) {
    columns.keyActor.appendValue(0)
    columns.keyCtr.appendValue(0)
    columns.keyStr.appendValue(null)
  } else if (op.key.value) {
    columns.keyActor.appendValue(null)
    columns.keyCtr.appendValue(null)
    columns.keyStr.appendValue(op.key.value)
  } else if (op.key.actorNum >= 0 && op.key.counter > 0) {
    columns.keyActor.appendValue(op.key.actorNum)
    columns.keyCtr.appendValue(op.key.counter)
    columns.keyStr.appendValue(null)
  } else {
    throw new RangeError(`Unexpected operation key: ${JSON.stringify(op.key)}`)
  }
}

/**
 * Encodes the `action` property of operation `op` into the `action` column.
 */
function encodeOperationAction(op, columns) {
  const actionCode = ACTIONS.indexOf(op.action)
  if (actionCode >= 0) {
    columns.action.appendValue(actionCode)
  } else if (typeof op.action === 'number') {
    columns.action.appendValue(op.action)
  } else {
    throw new RangeError(`Unexpected operation action: ${op.action}`)
  }
}

/**
 * Encodes the integer `value` into the two columns `valLen` and `valRaw`,
 * with the datatype tag set to `typeTag`. If `typeTag` is zero, it is set
 * automatically to signed or unsigned depending on the sign of the value.
 * Values with non-zero type tags are always encoded as signed integers.
 */
function encodeInteger(value, typeTag, columns) {
  let numBytes
  if (value < 0 || typeTag > 0) {
    numBytes = columns.valRaw.appendInt53(value)
    if (!typeTag) typeTag = VALUE_TYPE.LEB128_INT
  } else {
    numBytes = columns.valRaw.appendUint53(value)
    typeTag = VALUE_TYPE.LEB128_UINT
  }
  columns.valLen.appendValue(numBytes << 4 | typeTag)
}

/**
 * Encodes the `value` property of operation `op` into the two columns
 * `valLen` and `valRaw`.
 */
function encodeValue(op, columns) {
  if ((op.action !== 'set' && op.action !== 'inc') || op.value === null) {
    columns.valLen.appendValue(VALUE_TYPE.NULL)
  } else if (op.value === false) {
    columns.valLen.appendValue(VALUE_TYPE.FALSE)
  } else if (op.value === true) {
    columns.valLen.appendValue(VALUE_TYPE.TRUE)
  } else if (typeof op.value === 'string') {
    const numBytes = columns.valRaw.appendRawString(op.value)
    columns.valLen.appendValue(numBytes << 4 | VALUE_TYPE.UTF8)
  } else if (ArrayBuffer.isView(op.value)) {
    const numBytes = columns.valRaw.appendRawBytes(new Uint8Array(op.value.buffer))
    columns.valLen.appendValue(numBytes << 4 | VALUE_TYPE.BYTES)
  } else if (op.datatype === 'counter' && typeof op.value === 'number') {
    encodeInteger(op.value, VALUE_TYPE.COUNTER, columns)
  } else if (op.datatype === 'timestamp' && typeof op.value === 'number') {
    encodeInteger(op.value, VALUE_TYPE.TIMESTAMP, columns)
  } else if (typeof op.datatype === 'number' && op.datatype >= VALUE_TYPE.MIN_UNKNOWN &&
             op.datatype <= VALUE_TYPE.MAX_UNKNOWN && op.value instanceof Uint8Array) {
    const numBytes = columns.valRaw.appendRawBytes(op.value)
    columns.valLen.appendValue(numBytes << 4 | op.datatype)
  } else if (op.datatype) {
      throw new RangeError(`Unknown datatype ${op.datatype} for value ${op.value}`)
  } else if (typeof op.value === 'number') {
    if (Number.isInteger(op.value) && op.value <= Number.MAX_SAFE_INTEGER && op.value >= Number.MIN_SAFE_INTEGER) {
      encodeInteger(op.value, 0, columns)
    } else {
      // Encode number in 32-bit float if this can be done without loss of precision
      const buf32 = new ArrayBuffer(4), view32 = new DataView(buf32)
      view32.setFloat32(0, op.value, true) // true means little-endian
      if (view32.getFloat32(0, true) === op.value) {
        columns.valRaw.appendRawBytes(new Uint8Array(buf32))
        columns.valLen.appendValue(4 << 4 | VALUE_TYPE.IEEE754)
      } else {
        const buf64 = new ArrayBuffer(8), view64 = new DataView(buf64)
        view64.setFloat64(0, op.value, true) // true means little-endian
        columns.valRaw.appendRawBytes(new Uint8Array(buf64))
        columns.valLen.appendValue(8 << 4 | VALUE_TYPE.IEEE754)
      }
    }
  } else {
    throw new RangeError(`Unsupported value in operation: ${op.value}`)
  }
}

/**
 * Reads one value from the column `columns[colIndex]` and interprets it based
 * on the column type. `actorIds` is a list of actors that appear in the change;
 * `actorIds[0]` is the actorId of the change's author. Mutates the `value`
 * object with the value, and returns the number of columns processed (this is 2
 * in the case of a pair of VALUE_LEN and VALUE_RAW columns, which are processed
 * in one go).
 */
function decodeValue(columns, colIndex, actorIds, value) {
  const { columnId, columnName, decoder } = columns[colIndex]
  if (columnId % 8 === COLUMN_TYPE.VALUE_LEN && colIndex + 1 < columns.length &&
      columns[colIndex + 1].columnId === columnId + 1) {
    const sizeTag = decoder.readValue(), rawDecoder = columns[colIndex + 1].decoder
    if (sizeTag === VALUE_TYPE.NULL) {
      value[columnName] = null
    } else if (sizeTag === VALUE_TYPE.FALSE) {
      value[columnName] = false
    } else if (sizeTag === VALUE_TYPE.TRUE) {
      value[columnName] = true
    } else if (sizeTag % 16 === VALUE_TYPE.UTF8) {
      value[columnName] = rawDecoder.readRawString(sizeTag >> 4)
    } else {
      const bytes = rawDecoder.readRawBytes(sizeTag >> 4), valDecoder = new Decoder(bytes)
      if (sizeTag % 16 === VALUE_TYPE.LEB128_UINT) {
        value[columnName] = valDecoder.readUint53()
      } else if (sizeTag % 16 === VALUE_TYPE.LEB128_INT) {
        value[columnName] = valDecoder.readInt53()
      } else if (sizeTag % 16 === VALUE_TYPE.IEEE754) {
        const view = new DataView(bytes.buffer)
        if (bytes.byteLength === 4) {
          value[columnName] = view.getFloat32(0, true) // true means little-endian
        } else if (bytes.byteLength === 8) {
          value[columnName] = view.getFloat64(0, true)
        } else {
          throw new RangeError(`Invalid length for floating point number: ${bytes.byteLength}`)
        }
      } else if (sizeTag % 16 === VALUE_TYPE.COUNTER) {
        value[columnName] = valDecoder.readInt53()
        value[columnName + '_datatype'] = 'counter'
      } else if (sizeTag % 16 === VALUE_TYPE.TIMESTAMP) {
        value[columnName] = valDecoder.readInt53()
        value[columnName + '_datatype'] = 'timestamp'
      } else {
        value[columnName] = bytes
        value[columnName + '_datatype'] = sizeTag % 16
      }
    }
    return 2
  } else if (columnId % 8 === COLUMN_TYPE.ACTOR_ID) {
    value[columnName] = actorIds[decoder.readValue()]
  } else {
    value[columnName] = decoder.readValue()
  }
  return 1
}

/**
 * Encodes an array of operations in a set of columns. The operations need to
 * be parsed with `parseAllOpIds()` beforehand. Returns a map from column name
 * to Encoder object.
 */
function encodeOps(ops) {
  const columns = {
    objActor  : new RLEEncoder('uint'),
    objCtr    : new RLEEncoder('uint'),
    keyActor  : new RLEEncoder('uint'),
    keyCtr    : new DeltaEncoder(),
    keyStr    : new RLEEncoder('utf8'),
    insert    : new BooleanEncoder(),
    action    : new RLEEncoder('uint'),
    valLen    : new RLEEncoder('uint'),
    valRaw    : new Encoder(),
    chldActor : new RLEEncoder('uint'),
    chldCtr   : new RLEEncoder('uint'),
    predNum   : new RLEEncoder('uint'),
    predCtr   : new RLEEncoder('uint'),
    predActor : new RLEEncoder('uint')
  }

  for (let op of ops) {
    encodeObjectId(op, columns)
    encodeOperationKey(op, columns)
    columns.insert.appendValue(!!op.insert)
    encodeOperationAction(op, columns)
    encodeValue(op, columns)

    if (op.child.counter) {
      columns.chldActor.appendValue(op.child.actorNum)
      columns.chldCtr.appendValue(op.child.counter)
    } else {
      columns.chldActor.appendValue(null)
      columns.chldCtr.appendValue(null)
    }

    columns.predNum.appendValue(op.pred.length)
    for (let i = 0; i < op.pred.length; i++) {
      columns.predActor.appendValue(op.pred[i].actorNum)
      columns.predCtr.appendValue(op.pred[i].counter)
    }
  }
  return columns
}

/**
 * Takes a change as decoded by `decodeColumns`, and changes it into the form
 * expected by the rest of the backend.
 */
function decodeOps(ops) {
  const newOps = []
  for (let op of ops) {
    const newOp = {
      obj: op.objCtr === null ? ROOT_ID : `${op.objCtr}@${op.objActor}`,
      key: op.keyCtr === 0 ? '_head' : (op.keyStr || `${op.keyCtr}@${op.keyActor}`),
      action: ACTIONS[op.action] || op.action,
      pred: op.predNum.map(pred => `${pred.predCtr}@${pred.predActor}`)
    }
    if (op.insert) newOp.insert = true
    if (ACTIONS[op.action] === 'set' || ACTIONS[op.action] === 'inc') {
      newOp.value = op.valLen
      if (op.valLen_datatype) newOp.datatype = op.valLen_datatype
    }
    if (op.chldCtr !== null) newOp.child = `${op.chldCtr}@${op.chldActor}`
    newOps.push(newOp)
  }
  return newOps
}

function decodeColumns(decoder, actorIds) {
  let columns = []
  while (!decoder.done) {
    const columnId = decoder.readUint32()
    const columnBuf = decoder.readPrefixedBytes()
    let [columnName, _] = Object.entries(CHANGE_COLUMNS).find(([name, id]) => id === columnId)
    if (!columnName) columnName = columnId.toString()

    if (columnId % 8 === COLUMN_TYPE.INT_DELTA) {
      columns.push({columnId, columnName, decoder: new DeltaDecoder(columnBuf)})
    } else if (columnId % 8 === COLUMN_TYPE.BOOLEAN) {
      columns.push({columnId, columnName, decoder: new BooleanDecoder(columnBuf)})
    } else if (columnId % 8 === COLUMN_TYPE.STRING_RLE) {
      columns.push({columnId, columnName, decoder: new RLEDecoder('utf8', columnBuf)})
    } else if (columnId % 8 === COLUMN_TYPE.VALUE_RAW) {
      columns.push({columnId, columnName, decoder: new Decoder(columnBuf)})
    } else {
      columns.push({columnId, columnName, decoder: new RLEDecoder('uint', columnBuf)})
    }
  }

  let parsedOps = []
  while (!columns[0].decoder.done) {
    let op = {}, col = 0
    while (col < columns.length) {
      const columnId = columns[col].columnId
      let groupId = columnId >> 3, groupCols = 1
      while (col + groupCols < columns.length && columns[col + groupCols].columnId >> 3 === groupId) {
        groupCols++
      }

      if (columnId % 8 === COLUMN_TYPE.GROUP_CARD) {
        const values = [], count = columns[col].decoder.readValue()
        for (let i = 0; i < count; i++) {
          let value = {}
          for (let colOffset = 1; colOffset < groupCols; colOffset++) {
            decodeValue(columns, col + colOffset, actorIds, value)
          }
          values.push(value)
        }
        op[columns[col].columnName] = values
        col += groupCols
      } else {
        col += decodeValue(columns, col, actorIds, op)
      }
    }
    parsedOps.push(op)
  }
  return parsedOps
}

function encodeChangeHeader(encoder, change, actorIds) {
  encoder.appendPrefixedString(change.actor)
  encoder.appendUint53(change.seq)
  encoder.appendUint53(change.startOp)
  encoder.appendInt53(change.time)
  encoder.appendPrefixedString(change.message || '')
  encoder.appendUint53(actorIds.length)
  for (let actor of actorIds) encoder.appendPrefixedString(actor)
  const depsKeys = Object.keys(change.deps).sort()
  encoder.appendUint53(depsKeys.length)
  for (let actor of depsKeys) {
    encoder.appendUint53(actorIds.indexOf(actor) + 1)
    encoder.appendUint53(change.deps[actor])
  }
}

function decodeChangeHeader(decoder) {
  let change = {
    actor:   decoder.readPrefixedString(),
    seq:     decoder.readUint53(),
    startOp: decoder.readUint53(),
    time:    decoder.readInt53(),
    message: decoder.readPrefixedString(),
    deps: {}
  }
  const actorIds = [change.actor], numActorIds = decoder.readUint53()
  for (let i = 0; i < numActorIds; i++) actorIds.push(decoder.readPrefixedString())
  const numDeps = decoder.readUint53()
  for (let i = 0; i < numDeps; i++) {
    change.deps[actorIds[decoder.readUint53()]] = decoder.readUint53()
  }
  change.ops = decodeOps(decodeColumns(decoder, actorIds))
  return change
}

/**
 * Calls the `callback` with an encoder that should be used to encode the
 * contents of the container.
 */
function encodeContainerHeader(chunkType, callback) {
  const HASH_SIZE = 32 // size of SHA-256 hash
  const HEADER_SPACE = MAGIC_BYTES.byteLength + HASH_SIZE + 1 + 5 // 1 byte type + 5 bytes length
  const body = new Encoder()
  // Make space for the header at the beginning of the body buffer. We will
  // copy the header in here later. This is cheaper than copying the body since
  // the body is likely to be much larger than the header.
  body.appendRawBytes(new Uint8Array(HEADER_SPACE))
  callback(body)
  const bodyBuf = body.buffer

  const header = new Encoder()
  if (chunkType === 'document') {
    header.appendByte(0)
  } else if (chunkType === 'change') {
    header.appendByte(1)
  } else {
    throw new RangeError(`Unsupported chunk type: ${chunkType}`)
  }
  header.appendUint53(bodyBuf.byteLength - HEADER_SPACE)

  // Compute the hash over chunkType, length, and body
  const headerBuf = header.buffer
  const hash = new Hash()
  hash.update(headerBuf)
  hash.update(bodyBuf.subarray(HEADER_SPACE))

  // Copy header into the body buffer so that they are contiguous
  bodyBuf.set(MAGIC_BYTES,   HEADER_SPACE - headerBuf.byteLength - HASH_SIZE - MAGIC_BYTES.byteLength)
  bodyBuf.set(hash.digest(), HEADER_SPACE - headerBuf.byteLength - HASH_SIZE)
  bodyBuf.set(headerBuf,     HEADER_SPACE - headerBuf.byteLength)
  //console.log('hash: ', [...hash.digest()].map(x => `0x${x.toString(16)}`).join(', '))
  return bodyBuf.subarray(   HEADER_SPACE - headerBuf.byteLength - HASH_SIZE - MAGIC_BYTES.byteLength)
}

function decodeContainerHeader(decoder) {
  if (!compareBytes(decoder.readRawBytes(MAGIC_BYTES.byteLength), MAGIC_BYTES)) {
    throw new RangeError('Data does not begin with magic bytes 85 6f 4a 83')
  }
  const expectedHash = decoder.readRawBytes(32)
  const hashStartOffset = decoder.offset
  const chunkType = decoder.readByte()
  const chunkLength = decoder.readUint53()
  const chunkData = new Decoder(decoder.readRawBytes(chunkLength))
  const hash = new Hash()
  hash.update(decoder.buf.subarray(hashStartOffset, decoder.offset))
  if (!compareBytes(hash.digest(), expectedHash)) {
    throw new RangeError('Hash does not match data')
  }
  if (chunkType === 0) {
    // decode document
  } else if (chunkType === 1) {
    return decodeChangeHeader(chunkData)
  } else {
    console.log(`Warning: ignoring chunk with unknown type ${chunkType}`)
  }
}

function encodeChange(changeObj) {
  const { change, actorIds } = parseAllOpIds(changeObj)
  const columns = encodeOps(change.ops)
  const columnIds = Object.entries(CHANGE_COLUMNS).sort((a, b) => a[1] - b[1])

  return encodeContainerHeader('change', encoder => {
    encodeChangeHeader(encoder, change, actorIds)
    for (let [columnName, columnId] of columnIds) {
      if (columns[columnName]) {
        encoder.appendUint53(columnId)
        encoder.appendPrefixedBytes(columns[columnName].buffer)
      }
    }
  })
}

function decodeChange(buffer) {
  const decoder = new Decoder(buffer), changes = []
  do {
    const change = decodeContainerHeader(decoder)
    if (change) changes.push(change)
  } while (!decoder.done)
  return changes
}

module.exports = { encodeChange, decodeChange }
