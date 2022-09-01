# DUP DAO

## Introduction

I have made DUP DAO for the _Social & DAOs - DAO Voting Key Manager For UP Based DAO And Interface_ at **Hackathon: LUKSO Build UP! #1** .

For this hack I thought that DAOs are very well explored area in web3 and it makes no sense to invent the wheel from scratch. So I decided to go with open-zepplin contracts and make them compatible with LUKSO's LSP.

### Links:

- [Live Version](https://dupdao.com/)
- [Video Demo](https://www.youtube.com/watch?v=oc5A16wiLSQ)
- [Storage Test Contracts](https://www.dupdao.com/storage)
- [Frontend Reposity](https://github.com/Ajand/DUP-client)

### Authors

Aj Maz : aseedgeek@gmail.com

## Smart Contracts

I have transformed almost all of the open zepplin governance contracts to be compatible with LSPs and Lukso coding style. This make this project highly extensible while enjoying the security of open zepplin.

I have created an extension version LSP7 which I called it LSP7Votes that is based on OpenZepplin ERC20Votes and it adds snapshot and delegation features to it.

I have also created a DAO Factory that helps users to easily create DAOs.

When I was architecting the project I figured out that KeyManager is really good at what it does, so it makes no sense to transform it to support DAOs, so I decided to use Key Manager as is and add TimelockController ( which is ofcourse a controller! ) as its controller.

This way users can do all 5 types of actions that normal ERC725X users can do with the DAO universal profile.

![Architecture](https://iili.io/69GQyX.png)

## Frontend

When I read about LUKSO and LSPs, I thought that the LUKSO vision is for normal users of the internet, and for this vision to be completed we should have a wonderful UX. So I spent a lot of time optimizing the UX of my app and specially form design.
Here you can see some screen shots of the App:

<a href="https://freeimage.host/i/69kRgs"><img src="https://iili.io/69kRgs.md.png" alt="69kRgs.md.png" border="0"></a>
<a href="https://freeimage.host/i/69k7dG"><img src="https://iili.io/69k7dG.md.png" alt="69k7dG.md.png" border="0"></a>
<a href="https://freeimage.host/i/69kY7f"><img src="https://iili.io/69kY7f.md.png" alt="69kY7f.md.png" border="0"></a>
<a href="https://freeimage.host/i/69kae4"><img src="https://iili.io/69kae4.md.png" alt="69kae4.md.png" border="0"></a>

[This is the orginal video that I recorded 5 minutes before deadline](https://www.youtube.com/watch?v=_HufYMsxhdM)
