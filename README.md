![YZ.social](https://github.com/YZ-social/YZ01/blob/main/assets/YZ.social.png)
---

>Although end-to-end encryption does not directly concern the U.S. Constitution, Justice Antonin Scalia provided a prescient guide for reasoning about its costs. He wrote in 1987 in [Arizona v. Hicks](https://supreme.justia.com/cases/federal/us/480/321/), there is “nothing new in the realization that the Constitution sometimes insulates the criminality of a few in order to protect the privacy of us all.” 


YZ.social is an open source, permissionless, censorship resistant, end-to-end encrypted social network built on a fully decentralized network architecture.

YZ.social is a nearly pure peer-to-peer overlay network. There is a single application and it is responsible for all communication and structure. It is not completely pure, because it requires a way for a new user to bootstrap themselves into the network by using a STUN server. This is a very simple kind of matchmaking server that enables two nodes to connect directly. Once this connection is made, the new user is inserted into the YZ.social space and is able to securely and safely send messages to other users within the system.

The platform is built on top of the YZ.network, which is a private, permissionless, and censorship resistant distributed hash table. 

# Features

- Fully decentralized
- No central authority
- No server to take down
- End-to-end encryption
- Permissionless
- Censorship resistant
- Private
- Secure
- Fast
- Reliable
- Scalable
- Open source


# Ingredients

**P2P**

https://libp2p.io/

**Cap'n Proto Cerialization Protocol**

https://capnproto.org/

**IPFS**

https://ipfs.github.io/helia/index.html

**Signal Secure communication**

https://en.wikipedia.org/wiki/Signal_Protocol

https://signal.org/docs/

**Progressive Web App (implicit)**

https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps


# Architecture

TL;DR:

The foundation of the YZ.social network is based upon an extended Chord Distributed Hash Table algorithm in parallel with the IPFS protocol. The Chord algorithm is used for peer discovery and routing. The IPFS protocol is used for content addressing and storing data. All users have full access to both the Chord and IPFS systems. Before a new user joins the network, they construct a unique public/private key pair and use it to join the Chord network. A 16-bit location value is concatenated to the public key to construct the node ID. This node ID isa unique address for the user and enables other users to communicate with them. 

Users can only join the network by being sponsored by an existing user. This is done by the sponsoring user sending a connection message to the new user. This message can be delivered via a QR code or NFC on a mobile device. The new user then uses the STUN server to connect to the network. Once connected, the user is inserted into the Chord network and can start sending and receiving messages from other users.

The message structure utilizes the Cap'n Proto cerialization protocol. These messages include text, images, videos, audio, and other data. Media payloads are stored in the IPFS system and the message contains a CID (Content Identifier) for the payload. When a user accesses this message they use the CID to retrieve the payload from the IPFS system. 

Messages sent within the network are encrypted end-to-endusing the Signal Protocol. 

If a message contains a payload, such as an image, video, or audio, the payload is stored in the IPFS system. The message then contains a CID (Content Identifier) for the payload. When a user accesses this message they use the CID to retrieve the payload from the IPFS system. 

The app is implemented as a web page designed to be used as a Progressive Web App. It can be used on a desktop computer, tablet, or mobile phone. The app uses the browser's local storage to store the user's data. 

The snapshot state of this app is regularly saved onto IPFS. The app and all of its data can be instantly deleted from the device if required. The user can then reconstruct its full state from the IPFS snapshot. 

## Extended Chord Distributed Hash Table

The Chord system is used for peer discovery and routing. It is a Distributed Hash Table that uses a unique hash of the user's public key to determine its location in the network. 

The extended Chord system includes a low-resolution 16 bit location value that is used to determine the geographic region of the user. This value is used to ensure that users that are geographically close to each other, who would also tend to be closer connected, will have fewer routing hops between them which dramatically reduces latency. Regions are defined by a single number. As an example, North America may be made up of 6 approximate regions:

0010 Western Canada
0020 Eastern Canada
0030 Eastern United States
0040 Western United States
0050 Central United States
0060 Mexico

Thus, the full address of a user would be the concatenation of the region code and the user's public key. The user is able to specify any region code they wish, though it is recommended that they use the one that best describes their location. 

Users may have multiple accounts, each with a different region code. Each of these accounts will have a unique public/private key pair and thus a unique node ID. They enable a user to easily have different personas within the same network.

## Message Protocol

The message protocol is based upon the Cap'n Proto protocol described here:
https://capnproto.org/

The message protocol is used to send messages between users. It is a binary protocol that is designed to be fast and efficient. It is also designed to be easy to implement.

Payload data is stored within the IPFS system, so the message protocol is used to send the CID of the payload. When a user receives a message, they use the CID to retrieve the payload from the IPFS system.

## IPFS

The IPFS system is used for content addressing and storing data. All users have full access to the IPFS system. Messages can contain a payload, such as an image, video, or audio. If a message contains a payload, the payload is stored in the IPFS system. The message then contains a CID (Content Identifier) for the payload. When a user accesses this message they use the CID to retrieve the payload from the IPFS system. When the message arrives at the destination, the message is decrypted and the additional content is retrieved from the IPFS network. Once it is downloaded, the message can be displayed to the user. 

## Signal Protocol

The Signal Protocol is used for secure communication between users. It is a variant of the Double Ratchet algorithm.

https://signal.org/docs/

Based on the YZ.social requirements and Signal's available protocols, we will be implementing a combination of two key Signal protocols:

X3DH (Extended Triple Diffie-Hellman) for initial key exchange:
- Provides mutual authentication based on public keys
- Ensures forward secrecy
- Offers cryptographic deniability
- Perfect for the initial peer connection establishment in YZ.social's P2P network

Double Ratchet for ongoing message encryption:
- Provides continuous key rotation for each message
- Earlier keys cannot be calculated from later ones
- Integrates Diffie-Hellman public values with each message
- Protects against key compromise
- Ideal for the ongoing P2P message exchange

This combination is particularly well-suited for YZ.social because:
- It aligns with the decentralized architecture:
- No central key server required
- Works in peer-to-peer settings
- Supports asynchronous communication
- Provides the security properties mentioned in the README:
- End-to-end encryption
- Privacy
- Security
- Censorship resistance
- Supports the message structure requirements:
- Can encrypt both direct messages and payload CIDs
- Works with the AT Protocol message structure
- Handles asynchronous communication patterns

The implementation would look something like this:

```
class YZSecureChannel {
    constructor() {
        this.x3dh = new X3DHProtocol();  // Initial key exchange
        this.doubleRatchet = new DoubleRatchet();  // Ongoing encryption
        this.sessionState = null;
    }

    async establishConnection(peerPublicKey) {
        // X3DH key agreement
        const sharedSecret = await this.x3dh.performKeyAgreement(peerPublicKey);
        
        // Initialize Double Ratchet with shared secret
        this.sessionState = await this.doubleRatchet.initializeSession(sharedSecret);
    }

    async encryptMessage(message) {
        if (!this.sessionState) {
            throw new Error('Secure channel not established');
        }
        return await this.doubleRatchet.encrypt(message, this.sessionState);
    }

    async decryptMessage(encryptedMessage) {
        if (!this.sessionState) {
            throw new Error('Secure channel not established');
        }
        return await this.doubleRatchet.decrypt(encryptedMessage, this.sessionState);
    }
}

```


# References

## Decentralized Hash Tables and Network Architectures

https://www.spiceworks.com/tech/networking/articles/what-is-peer-to-peer/

**IPFS -Inter-Planetary File System**

https://ipfs.tech/

https://en.wikipedia.org/wiki/InterPlanetary_File_System

**Chord Algorithm - 2003**

**Chord: A Scalable Peer-to-peer Lookup Protocol for Internet Applications**

https://pdos.csail.mit.edu/papers/ton:chord/paper-ton.pdf

**Building Peer-to-Peer Systems With Chord, a Distributed Lookup Service**

https://www.cs.princeton.edu/courses/archive/spr05/cos598E/bib/dabek-chord.pdf

**Kademlia**

https://pdos.csail.mit.edu/~petar/papers/maymounkov-kademlia-lncs.pdf

https://www.scs.stanford.edu/~dm/home/papers/kpos.pdf

https://en.wikipedia.org/wiki/Kademlia

**System using Kademlia for connecting AI agents:**

https://www.ifaamas.org/Proceedings/aamas2021/pdfs/p1037.pdf

**S/Kademlia: A Practicable Approach Towards Secure Key-Based Routing**

https://telematics.tm.kit.edu/publications/Files/267/SKademlia_2007.pdf

**The Invisible Internet Project**  
The Invisible Internet Project (I2P) is a fully encrypted private network layer. It protects your activity and location. Every day people use the network to connect with people without worry of being tracked or their data being collected. In some cases people rely on the network when they need to be discrete or are doing sensitive work.

https://geti2p.net/en/

https://en.wikipedia.org/wiki/I2P

https://en.wikipedia.org/wiki/Mix_network

https://geti2p.net/en/docs/how/tech-intro

**Open DHT**

https://github.com/savoirfairelinux/opendht/wiki

**Pastry/Scribe**

https://rowstron.azurewebsites.net/PAST/pastry.pdf

https://en.wikipedia.org/wiki/Pastry_(DHT)

**Tapestry**

https://pdos.csail.mit.edu/~strib/docs/tapestry/tapestry_jsac03.pdf

https://en.wikipedia.org/wiki/Tapestry_(DHT)

**Brocade**

https://people.cs.uchicago.edu/~ravenben/publications/pdf/brocade.pdf

**Routing**

https://en.wikipedia.org/wiki/Garlic_routing

https://en.wikipedia.org/wiki/Mix_network

**Designing a Global Name Service - Lampson**

https://www.researchgate.net/publication/2389798_Designing_a_Global_Name_Service

## Decentralized Social Networks

**Social media platform**

https://www.weare8.com/about

**Open source video models:**
https://x.com/mickmumpitz/status/1867212037002334666

**Project Astra**

https://x.com/levie/status/1866881247236288734

**Bittensor**

https://bittensor.com/whitepaper

**Walrus**

https://docs.walrus.site/walrus.pdf

**I2P - Invisible Internet Project**

Java-based platform. Designed for very sophisticated users. Very brittle when attempting to run on Mac.

https://github.com/i2p

https://geti2p.net/en/docs

**Spatial Web**

https://spatialwebfoundation.org/wp-content/uploads/2024/10/Spatial-Web-Foundation_Specification-Introduction_2024-06-03.pdf

**Hyperspace**

https://hyper.space

Hyperspace is a breakthrough new generative browser powered by the world's largest peer-to-peer AI network.

https://zz4p5svitrvpdk0n.public.blob.vercel-storage.com/bittorrent-for-ai.pdf

https://x.com/HyperspaceAI

## Social Network Architectures

**Watts-Strogatz Collective dynamics of ‘small-world’ networks**
https://snap.stanford.edu/class/cs224w-readings/watts98smallworld.pdf
A really interesting metric is to compute the time a deadly infectious disease will propagate through the system. An infected node is removed from the system after it infects its connections.

**Barabási–Albert model**

This is an algorithm for generating random scale-free networks using a preferential attachment mechanism. Examples of this are social networks, where popular users attract more connections. The more popular they are, the more connections they get. Thus when a new user joins, they are highly likely to connect to a popular user, which makes them even more likely to attract new users.

https://en.wikipedia.org/wiki/Erd%C5%91s%E2%80%93R%C3%A9nyi_model

https://en.wikipedia.org/wiki/Watts%E2%80%93Strogatz_model

http://en.wikipedia.org/wiki/Barab%C3%A1si%E2%80%93Albert_model

https://en.wikipedia.org/wiki/Small-world_network
Collective Dynamics of “small-world” networks

https://snap.stanford.edu/class/cs224w-readings/watts98smallworld.pdf

https://networksciencebook.com/chapter/0#introduction0

# Security and Privacy

https://www.lawfaremedia.org/article/personal-data-in-the-cloud-is-under-siege.-end-to-end-encryption-is-our-most-powerful-defense

https://groups.csail.mit.edu/mac/classes/6.805/articles/privacy/Privacy_brand_warr2.html

https://email.projectliberty.io/policy-breakthrough-the-us-nears-a-historic-privacy-law

https://www.eff.org/issues/privacy

https://tech.eu/2025/02/10/new-roost-initiative-launches-at-paris-ai-summit-and-aims-to-secure-ai-with-open-source-safety-tools/


# Communication protocol

## Protocol Buffers

https://capnproto.org/

https://github.com/protocolbuffers/protobuf (slow)

https://github.com/capnproto/capnproto (fast)

## Fuchsia

https://fuchsia.dev/fuchsia-src/concepts/fidl/life-of-a-handle

https://sandstormorg/ - self hosted web apps.

# Proof of Personhood

https://proofofhumanity.id/

https://en.wikipedia.org/wiki/Proof_of_personhood

https://news.mit.edu/2024/3-questions-proving-humanity-online-0816

Personhood credentials: Artificial intelligence and the value of privacy-preserving tools to distinguish who is real online
https://arxiv.org/pdf/2408.07892

https://www.coinbase.com/learn/crypto-glossary/what-are-soulbound-tokens-sbt

## Application Resources

https://www.videosdk.live/developer-hub/webrtc/video-chat-app-with-webrtc-and-nodejs

libp2p is a modular networking framework bundled together as a full stack of protocols for peer-to-peer systems.

https://github.com/libp2p/libp2p

# Composition Prompts

## Generate public/private key pair, region code, and user ID

- Generate a 256 bit public/private key pair that is used for all communication.
- Determine the user's region code. This is a 16 bit value that is typically used to identify the user's geographic region, though the user can choose any value they wish. Incorporating a region code into the user's ID enables the user to be routed to other users within the same region. It is likely that most of a given user's connections will also be within the same region. This provides a clustering effect within the Chord algorithm which reduces latency.
- The user ID is this 16 bit region code concatenated with a 256 bit public key that is used to identify the node in the YZ.network.
- The extended public key is stored in the user's local storage.

## Chord Distributed Hash Table

- Share connection information using a QR code or NFC on a mobile device between the sponsoring user and the new user. This shared connection information includes the each user ID, which is the extended public key of the sponsoring user.
- The new user scans the QR code or uses NFC to read the connection information.
- The new user uses the STUN server to establish a connection to the the sponsoring user and thus connects to the YZ.network.

## Connection via STUN server

- The new user uses the STUN server to establish a connection to the network.
- The STUN server enables the new user to connect to the sponsoring user and thus connect to the YZ.network.

## Insert into Chord network

- The new user is inserted into the Chord network - the sponsoring user forwards the new user's connection information so that it can be added to the Chord network.
- The ID/address of the new user is their extended public key.

## Signal Protocol

- The Signal Protocol is used for secure communication between users.
- The Signal Protocol is used to encrypt all messages between users.
- The Signal Protocol is used to decrypt all messages between users.
- The Signal Protocol is used to generate the shared secret key between users.


